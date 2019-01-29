## Classes

<dl>
<dt><a href="#Request">Request</a></dt>
<dd><p>Instance of {Request} class is passed as first parameter of handler (req)</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Intent">Intent</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Subscribtion">Subscribtion</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Action">Action</a> : <code>Object</code></dt>
<dd></dd>
</dl>

{% raw %}<div id="Request">&nbsp;</div>{% endraw %}

## Request
Instance of {Request} class is passed as first parameter of handler (req)

**Kind**: global class  

* [Request](#Request)
    * [.params](#Request_params)
    * [.timestamp](#Request_timestamp)
    * [.senderId](#Request_senderId)
    * [.recipientId](#Request_recipientId)
    * [.pageId](#Request_pageId)
    * [.state](#Request_state)
    * [.subscribtions](#Request_subscribtions)
    * [.intent(getDataOrScore)](#Request_intent) ⇒ <code>null</code> \| <code>string</code> \| [<code>Intent</code>](#Intent)
    * [.isAttachment()](#Request_isAttachment) ⇒ <code>boolean</code>
    * [.isImage([attachmentIndex])](#Request_isImage) ⇒ <code>boolean</code>
    * [.isFile([attachmentIndex])](#Request_isFile) ⇒ <code>boolean</code>
    * [.hasLocation()](#Request_hasLocation) ⇒ <code>boolean</code>
    * [.getLocation()](#Request_getLocation) ⇒ <code>null</code> \| <code>Object</code>
    * [.attachment([attachmentIndex])](#Request_attachment) ⇒ <code>Object</code> \| <code>null</code>
    * [.attachmentUrl([attachmentIndex])](#Request_attachmentUrl) ⇒ <code>string</code> \| <code>null</code>
    * [.isMessage()](#Request_isMessage) ⇒ <code>boolean</code>
    * [.isQuickReply()](#Request_isQuickReply) ⇒ <code>boolean</code>
    * [.isText()](#Request_isText) ⇒ <code>boolean</code>
    * [.text([tokenized])](#Request_text) ⇒ <code>string</code>
    * [.expected()](#Request_expected) ⇒ <code>string</code> \| <code>null</code>
    * [.quickReply([getData])](#Request_quickReply) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>
    * [.isPostBack()](#Request_isPostBack) ⇒ <code>boolean</code>
    * [.isReferral()](#Request_isReferral) ⇒ <code>boolean</code>
    * ~~[.isPassThread()](#Request_isPassThread) ⇒ <code>boolean</code>~~
    * [.isOptin()](#Request_isOptin) ⇒ <code>boolean</code>
    * [.setAction(action, [data])](#Request_setAction) ⇒ [<code>Action</code>](#Action) \| <code>null</code> \| <code>undefined</code>
    * [.action([getData])](#Request_action) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>
    * [.postBack([getData])](#Request_postBack) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>

{% raw %}<div id="Request_params">&nbsp;</div>{% endraw %}

### request.params
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | plugin configuration |

{% raw %}<div id="Request_timestamp">&nbsp;</div>{% endraw %}

### request.timestamp
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type |
| --- | --- |
| timestamp | <code>number</code> \| <code>null</code> | 

{% raw %}<div id="Request_senderId">&nbsp;</div>{% endraw %}

### request.senderId
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| senderId | <code>string</code> | sender.id from the event |

{% raw %}<div id="Request_recipientId">&nbsp;</div>{% endraw %}

### request.recipientId
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | recipient.id from the event |

{% raw %}<div id="Request_pageId">&nbsp;</div>{% endraw %}

### request.pageId
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pageId | <code>string</code> | page identifier from the event |

{% raw %}<div id="Request_state">&nbsp;</div>{% endraw %}

### request.state
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | current state of the conversation |

{% raw %}<div id="Request_subscribtions">&nbsp;</div>{% endraw %}

### request.subscribtions
**Kind**: instance property of [<code>Request</code>](#Request)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| state | [<code>Array.&lt;Subscribtion&gt;</code>](#Subscribtion) | current state of the conversation |

{% raw %}<div id="Request_intent">&nbsp;</div>{% endraw %}

### request.intent(getDataOrScore) ⇒ <code>null</code> \| <code>string</code> \| [<code>Intent</code>](#Intent)
Returns intent, when using AI

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- getDataOrScore <code>boolean</code> | <code>number</code> <code> = false</code> - score limit or true for getting intent data

{% raw %}<div id="Request_isAttachment">&nbsp;</div>{% endraw %}

### request.isAttachment() ⇒ <code>boolean</code>
Checks, when message contains an attachment (file, image or location)

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isImage">&nbsp;</div>{% endraw %}

### request.isImage([attachmentIndex]) ⇒ <code>boolean</code>
Checks, when the attachment is an image

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [attachmentIndex] <code>number</code> <code> = 0</code> - use, when user sends more then one attachment

{% raw %}<div id="Request_isFile">&nbsp;</div>{% endraw %}

### request.isFile([attachmentIndex]) ⇒ <code>boolean</code>
Checks, when the attachment is a file

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [attachmentIndex] <code>number</code> <code> = 0</code> - use, when user sends more then one attachment

{% raw %}<div id="Request_hasLocation">&nbsp;</div>{% endraw %}

### request.hasLocation() ⇒ <code>boolean</code>
Checks for location in attachments

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_getLocation">&nbsp;</div>{% endraw %}

### request.getLocation() ⇒ <code>null</code> \| <code>Object</code>
Gets location coordinates from attachment, when exists

**Kind**: instance method of [<code>Request</code>](#Request)  
**Example**  
```javascript
const { Router } = require('wingbot');

const bot = new Router();

bot.use('start', (req, res) => {
    res.text('share location?', [
        // location share quick reply
        { action: 'locAction', title: 'Share location', isLocation: true }
    ]);
});

bot.use('locAction', (req, res) => {
    if (req.hasLocation()) {
        const { lat, long } = req.getLocation();
        res.text(`Got ${lat}, ${long}`);
    } else {
        res.text('No location received');
    }
});
```
{% raw %}<div id="Request_attachment">&nbsp;</div>{% endraw %}

### request.attachment([attachmentIndex]) ⇒ <code>Object</code> \| <code>null</code>
Returns whole attachment or null

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [attachmentIndex] <code>number</code> <code> = 0</code> - use, when user sends more then one attachment

{% raw %}<div id="Request_attachmentUrl">&nbsp;</div>{% endraw %}

### request.attachmentUrl([attachmentIndex]) ⇒ <code>string</code> \| <code>null</code>
Returns attachment URL

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [attachmentIndex] <code>number</code> <code> = 0</code> - use, when user sends more then one attachment

{% raw %}<div id="Request_isMessage">&nbsp;</div>{% endraw %}

### request.isMessage() ⇒ <code>boolean</code>
Returns true, when the request is text message, quick reply or attachment

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isQuickReply">&nbsp;</div>{% endraw %}

### request.isQuickReply() ⇒ <code>boolean</code>
Check, that message is a quick reply

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isText">&nbsp;</div>{% endraw %}

### request.isText() ⇒ <code>boolean</code>
Check, that message is PURE text

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_text">&nbsp;</div>{% endraw %}

### request.text([tokenized]) ⇒ <code>string</code>
Returns text of the message

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [tokenized] <code>boolean</code> <code> = false</code> - when true, message is normalized to lowercase with `-`

**Example**  
```javascript
console.log(req.text(true)) // "can-you-help-me"
```
{% raw %}<div id="Request_expected">&nbsp;</div>{% endraw %}

### request.expected() ⇒ <code>string</code> \| <code>null</code>
Returns the request expected handler in case have been set last response

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_quickReply">&nbsp;</div>{% endraw %}

### request.quickReply([getData]) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>
Returns action or data of quick reply
When `getData` is `true`, object will be returned. Otherwise string or null.

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [getData] <code>boolean</code> <code> = false</code>

**Example**  
```javascript
typeof res.quickReply() === 'string' || res.quickReply() === null;
typeof res.quickReply(true) === 'object';
```
{% raw %}<div id="Request_isPostBack">&nbsp;</div>{% endraw %}

### request.isPostBack() ⇒ <code>boolean</code>
Returns true, if request is the postback

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isReferral">&nbsp;</div>{% endraw %}

### request.isReferral() ⇒ <code>boolean</code>
Returns true, if request is the referral

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isPassThread">&nbsp;</div>{% endraw %}

### ~~request.isPassThread() ⇒ <code>boolean</code>~~
***Deprecated***

Returns true, if request pass thread control

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_isOptin">&nbsp;</div>{% endraw %}

### request.isOptin() ⇒ <code>boolean</code>
Returns true, if request is the optin

**Kind**: instance method of [<code>Request</code>](#Request)  
{% raw %}<div id="Request_setAction">&nbsp;</div>{% endraw %}

### request.setAction(action, [data]) ⇒ [<code>Action</code>](#Action) \| <code>null</code> \| <code>undefined</code>
Sets the action and returns previous action

**Kind**: instance method of [<code>Request</code>](#Request)  
**Returns**: [<code>Action</code>](#Action) \| <code>null</code> \| <code>undefined</code> - - previous action  
**Params**

- action <code>string</code> | [<code>Action</code>](#Action) | <code>null</code>
- [data] <code>Object</code>

{% raw %}<div id="Request_action">&nbsp;</div>{% endraw %}

### request.action([getData]) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>
Returns action of the postback or quickreply
When `getData` is `true`, object will be returned. Otherwise string or null.

1. the postback is checked
2. the referral is checked
3. the quick reply is checked
4. expected keywords are checked
5. expected state is checked

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [getData] <code>boolean</code> <code> = false</code>

**Example**  
```javascript
typeof res.action() === 'string' || res.action() === null;
typeof res.action(true) === 'object';
```
{% raw %}<div id="Request_postBack">&nbsp;</div>{% endraw %}

### request.postBack([getData]) ⇒ <code>null</code> \| <code>string</code> \| <code>Object</code>
Returns action or data of postback
When `getData` is `true`, object will be returned. Otherwise string or null.

**Kind**: instance method of [<code>Request</code>](#Request)  
**Params**

- [getData] <code>boolean</code> <code> = false</code>

**Example**  
```javascript
typeof res.postBack() === 'string' || res.postBack() === null;
typeof res.postBack(true) === 'object';
```
{% raw %}<div id="Intent">&nbsp;</div>{% endraw %}

## Intent : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| intent | <code>string</code> | 
| score | <code>number</code> | 
| [entities] | <code>Array.&lt;Object&gt;</code> | 

{% raw %}<div id="Subscribtion">&nbsp;</div>{% endraw %}

## Subscribtion : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| tag | <code>string</code> | 
| ts | <code>number</code> | 

{% raw %}<div id="Action">&nbsp;</div>{% endraw %}

## Action : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| action | <code>string</code> | 
| data | <code>Object</code> | 

