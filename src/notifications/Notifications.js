/*
 * @author David Menger
 */
'use strict';

const { EventEmitter } = require('events');
const Request = require('../Request');
const NotificationsStorage = require('./NotificationsStorage');
const api = require('./api');
const customFn = require('../utils/customFn');

const DEFAULT_LIMIT = 20;
const WINDOW_24_HOURS = 86400000; // 24 hours
const REMOVED_CAMPAIGN = '<removed campaign>';

const DEFAULT_CAMPAIGN_DATA = {
    sent: 0,
    failed: 0,
    delivery: 0,
    read: 0,
    notSent: 0,
    leaved: 0,
    queued: 0,
    positive: 0,
    negative: 0,
    startAt: null,
    sliding: false,
    slide: null,
    allowRepeat: false,
    type: null,
    hasCondition: false,
    condition: null
};

/**
 * Experimental notifications service
 */
class Notifications extends EventEmitter {

    /**
     *
     * @param {NotificationsStorage} notificationStorage
     * @param {Object} options
     * @param {console} [options.log]
     * @param {boolean} [options.sendMoreMessagesOver24]
     */
    constructor (notificationStorage = new NotificationsStorage(), options = {}) {
        super();

        this._storage = notificationStorage;
        this._log = options.log || console;
        this.limit = DEFAULT_LIMIT;
        this._sendMoreMessagesOver24 = options.sendMoreMessagesOver24;

        // ensure unique timestamps for messages
        this._lts = new Map();
    }

    /**
     * API Factory
     *
     * @param {string[]|Function} [acl] - limit api to array of groups or use auth function
     * @returns {Object} - the graphql api object
     */
    api (acl = null) {
        return api(this._storage, this, acl);
    }

    async createCampaign (
        name,
        action,
        data = {},
        options = {}
    ) {

        const campaign = {
            name,
            action,
            data,
            pageId: null
        };

        Object.assign(campaign, DEFAULT_CAMPAIGN_DATA, {
            startAt: null,
            active: true,
            in24hourWindow: true,
            include: [],
            exclude: []
        }, options);

        return this._storage.upsertCampaign(campaign);
    }

    async _pushTasksToQueue (campaignTargets) {
        if (campaignTargets.length === 0) {
            return [];
        }

        const campaigns = new Map();

        const tasks = campaignTargets
            .map((target) => {
                if (!campaigns.has(target.campaignId)) {
                    campaigns.set(target.campaignId, { i: 1 });
                } else {
                    campaigns.get(target.campaignId).i++;
                }

                return {
                    campaignId: target.campaignId,
                    senderId: target.senderId,
                    pageId: target.pageId,
                    enqueue: target.enqueue, // time, when campaign should be fired,
                    sent: null,
                    read: null,
                    delivery: null
                };
            });

        const ret = await this._storage.pushTasks(tasks);

        for (const [campaignId, { i }] of campaigns.entries()) {
            await this._storage.incrementCampaign(campaignId, { queued: i });
        }

        return ret;
    }

    /**
     * Subscribe user under certain tag
     *
     * @param {string} senderId
     * @param {string} pageId
     * @param {string} tag
     */
    async subscribe (senderId, pageId, tag) {
        this._reportEvent('subscribed', tag, { senderId, pageId });
        await this._storage.subscribe(`${senderId}`, pageId, tag);
    }

    /**
     * Unsubscribe user from certain tag or from all tags
     *
     * @param {string} senderId
     * @param {string} pageId
     * @param {string} [tag]
     */
    async unsubscribe (senderId, pageId, tag = null) {
        const unsubscibtions = await this._storage
            .unsubscribe(senderId, pageId, tag);

        unsubscibtions
            .forEach(sub => this._reportEvent('unsubscribed', sub, { senderId, pageId }));

    }

    /**
     * Preprocess message - for read and delivery
     *
     * @param {Object} event
     * @param {string} pageId
     * @returns {Promise<{status:number}>}
     */
    async processMessage (event, pageId) {
        if (!event.sender || (!event.read && !event.delivery)) {
            return {
                status: 204
            };
        }

        const eventType = event.read ? 'read' : 'delivery';
        const { watermark } = event[eventType];
        const { timestamp: ts = Date.now() } = event;
        const senderId = event.sender.id;

        const tasks = await this._storage
            .updateTasksByWatermark(senderId, pageId, watermark, eventType, ts);

        await Promise.all(tasks
            .map(task => this._messageDeliveryByMid(task.campaignId, eventType, senderId, pageId)));

        return {
            status: 200
        };
    }

    async _messageDeliveryByMid (campaignId, eventType, senderId, pageId) {
        const campaign = await this._storage.incrementCampaign(campaignId, {
            [eventType]: 1
        });

        const campaignName = campaign ? campaign.name : REMOVED_CAMPAIGN;
        this._reportEvent(eventType, campaignName, { senderId, pageId });
    }

    async _preloadSubscribtions (senderId, pageId, req, res) {
        if (res.data.notificationSubscribtions) {
            return;
        }

        req.subscribtions = await this._storage.getSenderSubscribtions(senderId, pageId);
        const notificationSubscribtions = {};

        req.subscribtions.forEach((subscribtion) => {
            Object.assign(notificationSubscribtions, {
                [subscribtion]: true
            });
        });

        res.setData({ notificationSubscribtions });
    }

    middleware () {
        const notifications = this;
        return async (req, res) => {
            Object.assign(res, {
                subscribe (tag) {
                    notifications
                        .subscribe(req.senderId, req.pageId, tag)
                        .catch(e => notifications._log.error(e));
                },
                unsubscribe (tag = null) {
                    notifications
                        .unsubscribe(req.senderId, req.pageId, tag)
                        .catch(e => notifications._log.error(e));
                }
            });

            // is action
            const { campaign } = req;

            if (!campaign) {
                // track campaign success
                const { _ntfLastCampaignId: lastCampaignId } = req.state;
                if (lastCampaignId) {
                    res.setState({
                        _ntfLastCampaignId: null,
                        _ntfLastCampaignName: null
                    });

                    const { _trackAsNegative: isNegative = false } = req.action(true);

                    this._reportCampaignSuccess(
                        isNegative ? 'negative' : 'positive',
                        lastCampaignId,
                        req.state._ntfLastCampaignName,
                        { senderId: req.senderId, pageId: req.pageId }
                    );
                }

                await this._postponeTasksOnInteraction(req, res);

                return true;
            }

            await this._preloadSubscribtions(req.senderId, req.pageId, req, res);

            // ensure again the user has corresponding tags
            const isStillTargetGroup = ((campaign.include.length === 0
                && (!campaign.pageId || campaign.pageId === req.pageId)
                && req.subscribtions.length !== 0)
                    || req.subscribtions.some(s => campaign.include.includes(s)))
                && !req.subscribtions.some(s => campaign.exclude.includes(s));

            if (!isStillTargetGroup) {
                return null; // Router.END;
            }

            if (!campaign.allowRepeat) {
                const task = await this._storage.getSentTask(req.pageId, req.senderId, campaign.id);

                if (task) {
                    return null; // Router.END;
                }
            }

            if (campaign.hasCondition) {
                const fn = customFn(campaign.condition, `Campaign "${campaign.name}" condition`);

                const fnRes = fn(req, res);

                if (!fnRes) {
                    return null; // Router.END;
                }
            }

            res.setMessgingType(campaign.type || 'UPDATE');

            if (!campaign.in24hourWindow) {
                this._setLastCampaign(res, campaign);
                return true;
            }

            const { _ntfLastInteraction = Date.now(), _ntfOverMessageSent } = req.state;
            const inTimeFrame = Date.now() < (_ntfLastInteraction + WINDOW_24_HOURS);

            // do not send one message over, because of future campaigns
            if (inTimeFrame) {
                this._setLastCampaign(res, campaign);
                return true;
            }

            if (!this._sendMoreMessagesOver24 && !inTimeFrame && _ntfOverMessageSent) {
                return null; // Router.END;
            }

            res.setState({ _ntfOverMessageSent: true });

            this._setLastCampaign(res, campaign);
            return true;
        };
    }

    _reportCampaignSuccess (eventName, campaignId, campaignName, meta) {
        this._storage.incrementCampaign(campaignId, { [eventName]: 1 })
            .catch(e => this._log.error('report campaign success store', e));
        this._reportEvent(eventName, campaignName, meta);
    }

    _setLastCampaign (res, campaign) {
        res.setState({
            _ntfLastCampaignId: campaign.id,
            _ntfLastCampaignName: campaign.name
        });
    }

    async _postponeTasksOnInteraction (req, res) {
        // load sliding campaigns and postpone/insert their actions
        const { data } = await this._storage.getCampaigns({
            sliding: true, active: true
        });

        const slidingCampaigns = data
            .filter(c => (!c.pageId || c.pageId === `${req.pageId}`));

        let { _ntfSlidingCampTasks: cache = [] } = req.state;

        // remove the old tasks or tasks without campaigns
        cache = cache.filter(t => t.enqueue >= req.timestamp
            && slidingCampaigns.some(c => c.id === t.campaignId));

        // postpone existing
        cache = cache.map((t) => {
            const campaign = slidingCampaigns.find(c => c.id === t.campaignId);
            const enqueue = req.timestamp + campaign.slide;
            return Object.assign({}, t, { enqueue });
        });
        await Promise.all(cache
            .map(({ id, enqueue }) => this._storage.updateTask(id, { enqueue })));

        // missing tasks in cache
        const { senderId, pageId } = req;
        const insert = slidingCampaigns
            .filter(c => !cache.some(t => t.campaignId === c.id))
            .map(c => ({
                senderId,
                pageId,
                campaignId: c.id,
                enqueue: req.timestamp + c.slide
            }));

        // insert tasks for sliding campaigns
        const insertedTasks = await this._pushTasksToQueue(insert);
        cache.push(...insertedTasks.map(t => ({
            id: t.id,
            campaignId: t.campaignId,
            enqueue: t.enqueue
        })));

        res.setState({
            _ntfLastInteraction: req.timestamp,
            _ntfOverMessageSent: false,
            _ntfSlidingCampTasks: cache
        });
    }

    /**
     * Run the campaign now (push tasks into the queue)
     *
     * @param {Object} campaign
     * @returns {Promise<{queued:number}>}
     */
    async runCampaign (campaign) {
        let hasUsers = true;
        let lastKey = null;

        const { include, exclude } = campaign;

        const enqueue = campaign.startAt || Date.now();

        let queued = 0;

        while (hasUsers) {
            const { data: targets, lastKey: key } = await this._storage
                .getSubscribtions(include, exclude, this.limit, campaign.pageId, lastKey);

            lastKey = key;

            const campaignTargets = targets.map(target => ({
                senderId: target.senderId,
                pageId: target.pageId,
                campaignId: campaign.id,
                enqueue
            }));

            const actions = await this._pushTasksToQueue(campaignTargets);

            queued += actions.length;

            hasUsers = targets.length > 0 && lastKey;
        }

        return { queued };
    }

    async processQueue (processor, timeLimit = 45000, timeStart = Date.now()) {
        // first, check out shedulled campaigns
        let run = true;
        const begin = Date.now();
        while (run) {
            const now = timeStart + (Date.now() - begin);
            const pop = await this._storage.popCampaign(now);

            if (pop) {
                await this.runCampaign(pop);
            } else {
                run = false;
            }
        }

        run = true;

        while (run) {
            const now = timeStart + (Date.now() - begin);
            const pop = await this._storage.popTasks(this.limit, now);
            await this._processPoppedTasks(pop, processor);

            run = pop.length !== 0 && (timeStart + timeLimit) > Date.now();
        }
    }

    async _processPoppedTasks (pop, processor) {
        const campaignIds = pop.reduce((arr, task) => {
            if (arr.indexOf(task.campaignId) === -1) {
                arr.push(task.campaignId);
            }
            return arr;
        }, []);
        const campaigns = await this._storage.getCampaignByIds(campaignIds);

        return Promise.all(pop
            .map((task) => {
                const campaign = campaigns.find(c => c.id === task.campaignId);
                return this._processTask(processor, task, campaign);
            }));
    }

    _uniqueTs (senderId) {
        // campaign should be in active state
        let ts = Date.now();
        if (this._lts.has(senderId)) {
            const lts = this._lts.get(senderId);
            if (lts >= ts) {
                ts = lts + 1;
            }
        }
        this._lts.set(senderId, ts);
        // compact, if it's large
        if (this._lts.size > 50) {
            const keep = ts - 1000;
            this._lts = new Map(Array.from(this._lts.entries())
                .filter(e => e[1] > keep));
        }
        return ts;
    }

    async _processTask (connector, task, campaign) {
        const ts = this._uniqueTs(task.senderId);

        if (!campaign || !campaign.active) {
            await this._finishTask('notSent', campaign, task, ts);
            return;
        }

        const message = Request.campaignPostBack(task.senderId, campaign, ts);
        let status;
        let mid;

        try {
            const result = await connector.processMessage(message, task.senderId, task.pageId);
            status = result.status; // eslint-disable-line prefer-destructuring
            mid = result.responses && result.responses.length
                && result.responses[result.responses.length - 1].message_id;
        } catch (e) {
            this._log.error('send notification error', e);
            status = 500;
        }

        try {
            await this._storeSuccess(campaign, status, task, mid, ts);
        } catch (e) {
            this._log.error('store notification state error', e);
        }
    }

    async _storeSuccess (campaign, status, task, mid, ts) {
        switch (status) {
            case 200:
                await this._finishTask('sent', campaign, task, ts, mid);
                break;
            case 204:
                await this._finishTask('notSent', campaign, task, ts);
                break;
            case 403:
                await Promise.all([
                    this._finishTask('leaved', campaign, task, ts),
                    this.unsubscribe(task.senderId, task.pageId)
                ]);
                break;
            case 500:
            default:
                await this._finishTask('failed', campaign, task, ts);
                break;
        }
    }

    async _finishTask (eventName, campaign, task, ts, mid = null) {
        const { senderId, pageId } = task;
        const promises = [];
        if (mid !== null) {
            promises.push(this._storage.updateTask(task.id, { mid, sent: ts }));
        }
        if (campaign) {
            promises.push(this._storage.incrementCampaign(campaign.id, { [eventName]: 1 }));
        }
        await Promise.all(promises);

        const campaignName = campaign ? campaign.name : REMOVED_CAMPAIGN;
        this._reportEvent(eventName, campaignName, { senderId, pageId });
    }

    _reportEvent (event, campaignNameOrTag, meta) {
        try {
            this.emit('report', event, campaignNameOrTag, meta);
        } catch (e) {
            this._log.error('report event emit error', e);
        }
    }

}

module.exports = Notifications;