#mosaic-rest-js

### About
This is a js library for Backbase [REST API] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest.html).

## Example:

#### nodejs
```js
var BBRest = require('mosaic-rest-js'),
var bbrest = new BBRest({
   portal: 'myPortal'
 });
```

#### AMD module
```js
require(['bbrest'], function(BBRest) {
  var bbrest = new BBRest({
    portal: 'myPortal'
  });
})
```

```js
// list portals
bbrest.server().get().then(function(value) {
 if (value.statusCode === 200) {
   console.log('Response OK');
 }
});

// add portal
bbrest.server().post('addPortal.xml').then(function(d) {
  console.log(d);
});
 
// update portal
bbrest.server().put('updatePortal.xml').then(function(d) {
 console.log(d);
}); 

// list 5 items from catalog
bbrest.catalog().query({ps:5}).get().then(function(d) {
 console.log(d);
});
```

## Automation:

```js
npm install // install nodejs dependencies
bower install // install bower dependecies
gulp node // build node distribution file
gulp jquery // build browser jQuery based ditribution file
gulp min // minify browser distribution file
gulp test-node // run node tests (requires running portal)
gulp test-jq // run phantomjs tests (requires running portal)
```

## BBRest methods
#### constructor(config:Object)
BBRest Constructor.
- config - *extends default configuration*

**configuration defaults:**
```
{
  host: 'localhost', 
  port: '7777',
  context: 'portalserver',
  username: 'admin',
  password: 'admin',
  portal: null // name of the targeted portal,
  plugin: null // function to pre-process data
}
```
#### server()
Prepares request on server domain. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_portal.html)
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.server().get(); // returns list of portals
bbrest.server().post('path.to.xml'); // creates a portal
bbrest.server().put('path.to.xml'); // updates portal(s)
```

#### portal()
Prepares request on portal domain. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_portal.html)
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.portal().put('path.to.xml'); // updates portal
bbrest.portal().delete(); // deletes the portal

bbrest.portal().get(); // returns portal data

bbrest.portal().rights().get(); // returns portal rights
bbrest.portal().rights().put('path.to.xml'); // updates portal rights

bbrest.portal().tags().get(); // returns portal tags
bbrest.portal().tags().post('path.to.xml'); // creates a tag
bbrest.portal().tags('myTag').delete(); // deletes a tag
```
#### catalog(item)
Prepares request on server catalog. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_portal.html)
- **item** - name of the item in server catalog
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.catalog().get(); // returns server catalog
bbrest.catalog().post('path.to.xml'); // add item(s) to server catalog
bbrest.catalog().put('path.to.xml'); // updates item(s) in server catalog
bbrest.catalog().delete('path.to.xml'); // batch delete items from the server catalog

bbrest.catalog('myItem').get(); // returns item from the server catalog
bbrest.catalog('myItem').delete(); // deletes item from the server catalog
```
#### portalCatalog(item)
Prepares request on portal catalog. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_portal.html)
- **item** - name of the item in porta catalog
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.portalCatalog().get(); // returns portal catalog
bbrest.portalCatalog().post('path.to.xml'); // add item(s) to portal catalog
bbrest.portalCatalog().put('path.to.xml'); // updates item(s) in portal catalog
bbrest.portalCatalog().delete('path.to.xml'); // batch delete items from the portal catalog

bbrest.portalCatalog('myItem').get(); // returns item from the portal catalog
bbrest.portalCatalog('myItem').delete(); // deletes item from the portal catalog
```

#### page(name:String)
Prepares page request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_page.html)
- **name** - name of the page to target
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.page().get(); // returns portal pages
bbrest.page().post('path.to.xml'); // creates page(s)
bbrest.page().put('path.to.xml'); // updates page(s)

bbrest.page('name').get(); // returns page
bbrest.page('name').put('path.to.xml'); // updates page
bbrest.page('name').delete(); // deletes page

bbrest.page('name').rights().get(); // returns page rights
bbrest.page('name').rights().put('path.to.xml'); // updates page rights
```

#### container(name:String)
Prepares container request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_pcat_cont.html)
- **name** - name of the container to target
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.container().get(); // returns portal containers
bbrest.container().post('path.to.xml'); // creates a container(s)
bbrest.container().put('path.to.xml'); // updates container(s)

bbrest.container('name').get(); // returns container
bbrest.container('name').put('path.to.xml'); // updates container
bbrest.container('name').delete(); // deletes container

bbrest.container('name').rights().get(); // returns container rights
bbrest.container('name').rights().put('path.to.xml'); // updates container rights
```

#### widget(name:String)
Prepares widget request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_pcat_widg.html)
- **name** - name of the widget to target
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.widget().get(); // returns portal widgets
bbrest.widget().post('path.to.xml'); // creates a widget(s)
bbrest.widget().put('path.to.xml'); // updates widget(s)

bbrest.widget('name').get(); // returns widget
bbrest.widget('name').put('path.to.xml'); // updates widget
bbrest.widget('name').delete(); // deletes widget

bbrest.widget('name').rights().get(); // returns widget rights
bbrest.widget('name').rights().put('path.to.xml'); // updates widget rights
```

#### link(name:String)
Prepares link request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_link.html)
- **name** - name of the link to target
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.link().get(); // returns portal links
bbrest.link().post('path.to.xml'); // creates link(s)
bbrest.link().put('path.to.xml'); // updates link(s)

bbrest.link('name').get(); // returns link
bbrest.link('name').put('path.to.xml'); // updates link
bbrest.link('name').delete(); // deletes link

bbrest.link('name').rights().get(); // returns link rights
bbrest.link('name').rights().put('path.to.xml'); // updates link rights
```

#### template(name:String)
Prepares template request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_template.html)
- **name** - name of the template to target
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.template().get(); // returns portal templates
bbrest.template().post('path.to.xml'); // creates template(s)

bbrest.template('name').get(); // returns template
bbrest.template('name').put('path.to.xml'); // updates template

bbrest.template('name').rights().get(); // returns template rights
bbrest.template('name').rights().put('path.to.xml'); // updates template rights
```

#### user(name:String, showGroups:Boolean, groupName:String)
Prepares user request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_user.html)
- **name** - name of the user to target
- **showGroups** - if true, user groups are targeted
- **groupName** - name of the group to delete user from
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.user().get(); // returns list of users
bbrest.user().post('path.to.xml'); // creates a user

bbrest.user('user').get(); // returns user
bbrest.user('user').put('path.to.xml'); // updates user
bbrest.user('user').delete(); // deletes user

bbrest.user('user', true).get(); // returns groups that user belongs to
bbrest.user('user', true).post('path.to.xml'); // adds user to group(s)
bbrest.user('user', true, 'group').delete(); // removes user from a group
```

#### group(name:String, showUsers:Boolean)
Prepares group request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_group.html)
- **name** - name of the group to target
- **showUsers** - if true, group's users are targeted
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.group().get(); // returns list of groups
bbrest.group().post('path.to.xml'); // creates a group

bbrest.group('group').get(); // returns group
bbrest.group('group').put('path.to.xml'); // updates group
bbrest.group('group').delete(); // deletes group

bbrest.group('group', true).get(); // returns users that belong to a group
bbrest.group('group', true).post('path.to.xml'); // adds user(s) to group
bbrest.group('group', true, 'user').delete(); // removes user from a group
```

#### audit(meta:Boolean)
Prepares audit trails request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_audit.html)
- **meta** - if true, targets audit metadat, otherwise it targets audit events
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.audit().get(); // returns auditEvents
bbrest.audit(true).get(); // returns auditMetaData
```

#### cache(type:String)
Prepares cache request. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_caches.html)
- **type** - possible values: global, widget, chrome, closure, url, web, gmodel
- *returns* instance of the [BBReq] (#BBReq)

Valid Requests, returning promises:
```
bbrest.cache('all').delete(); // sends all of the below requests one by one

bbrest.cache('globalModelCache').delete();
bbrest.cache('retrievedWidgetCache').delete();
bbrest.cache('widgetChromeStaticCache').delete();
bbrest.cache('serverSideClosureCache').delete();
bbrest.cache('urlLevelCache').delete();
bbrest.cache('webCache').delete();
bbrest.cache('gModelCache').delete();
bbrest.cache('uuidFromExtendedItemNamesCache').delete();
bbrest.cache('springAclSidCacheRegion').delete();
bbrest.cache('contextNameToItemNameToUuidCache').delete();
bbrest.cache('widgetCache').delete();
bbrest.cache('uuidToContentReferencesCache').delete();
bbrest.cache('springAclCacheRegion').delete();
bbrest.cache('itemUuidToReferencingLinkUuidsCache').delete();
bbrest.cache('uuidToCacheKeysCache').delete();
bbrest.cache('versionBundleCache').delete();
```
You can [get bookmarklet] (http://goo.gl/YqOrp8) to delete all caches at once.
#### auto(data)
Performs POST or PUT request by finding the right BBRest method from the data.
- **data** - if string, represents path of the xml file which content will be sent. If object, it is first sent to config.plugin function
- *returns* promise with response value

Valid Request, returning promises:
```
bbrest.auto('path.to.xml');
```
## BBReq methods
#### rights()
Modifies request to target rights.
- *returns* instance of the [BBReq] (#BBReq)

#### tag(name:String)
Modifies request to target tags
- *returns* instance of the [BBReq] (#BBReq)

### query(obj:Object)
Defines modifiers. [API Reference] (https://my.backbase.com/resources/documentation/portal/5.5.1.0/refc_rest_urlmod.html)
- **obj** - object with querystring values to be appended to the uri
- *returns* instance of the [BBReq] (#BBReq)

#### get()
Performs GET request
- *returns* promise with response value

#### post(data)
Performs POST request
- **data** - if string, represents path of the xml file which content will be sent. If object, it is first sent to config.plugin function
- *returns* promise with response value
``` js
bbrest.config.plugin = function(data) {
    return jxon.jsToString(data); // converts js object in jxon notation to XML string which will be posted
}
bbrest.widget('myWidget').post(jxonObj);
```

#### put(data)
Performs PUT request
- **data** - if string, represents path of the xml file which content will be sent. If object, it is first sent to config.plugin function
- *returns* promise with response value

#### delete(data)
Performs DELETE request
- **data** - if string, represents path of the xml file which content will be sent. If object, it is first sent to config.plugin function
- *returns* promise with response value

**response value:**
```
{
  error: // true if is error
  statusCode: // http status code
  statusInfo: // http status code description or error infor
  body: // contains body of the server response,
  href: // request location,
  method: // request method,
  reqBody: // request body,
  file: // file name,
  headers: // response headers
}
```

