# RibbonPlus

Have you ever tried to add a button into a Sharepoint ribbon ? Even if it exists [some ways](http://sharepoint.stackexchange.com/questions/74674/how-can-i-add-a-custom-tab-to-a-ribbon-at-runtime-using-javascript-ecmascript), Microsoft made it very difficult to use and with no documentation.

After spending a couple of days, I've been able to create RibbonPlus that permits to create tabs and buttons into a Sharepoint ribbon without all the pain.

## How to use it

Just call `ribbonplus.min.js` in the browser.

## Example

```javascript
var rp = new RibbonPlus();
// make sure the ribbon is ready
rp.ready(function() {
  // let's create a Tab called "My Toolbar" just before the Edit tab
  rp.addTab("My Toolbar", { before:"Edit" });
  // in this tab we create a group of buttons called "My Actions"
  rp.addGroup("My Toolbar", "My Actions");
  // and now we add one big button
  rp.addButtons("My Toolbar", "My Actions", [
    {
      name:"Magic",
      image:"/somewhere/youramazingimage32x32.png",
      descriptionTitle:"The Magical Button",
      description:"This button will do some amazin things !",
      onclick:function() {
        alert("You clicked on the magical button")
      }
    }
  ]);
  // now let's add 3 small buttons in My Actions too
  rp.addButtons("My Toolbar", "My Actions", [
    {
      name:"Button1",
      image:"/somewhere/buttonsmall16x16.png",
      descriptionTitle:"Small Button 1",
      description:"This button is small but can do big things",
      onclick:function() {
        alert("Small Button 1 pressed")
      }
    },
    {
      name:"Button2",
      descriptionTitle:"The Second Small button",
      description:"Because it's a test",
      onclick:function() {
        alert("Second Small Button works too !")
      }
    },
    {
      name:"Button3",
      descriptionTitle:"The Last One",
      description:"The last but not least",
      onclick:function() {
        alert("Yeah!")
      }
    }
  ]);
  
  // we can also add buttons to the existing tabs/groups
  // e.g. you can add a button in the Edit tab, in the Commit group
  rp.addButtons("Edit", "Commit", [
    {
      name:"Save Draft",
      descriptionTitle:"Save As A Draft",
      description:"You can save your form as a draft and edit it again later.",
      onclick:function() {
        alert("You do some magical stuff here")
      }
    }
  ])
;})
```

### Documentation

Each function is documented.

#### addTab(tabName, [options])

Permits to create a new Tab into the Ribbon.
 
 ```
@param {String} tabName The tab name that appears at the top of the ribbon (e.g. "Edit")
@param {Object} [options]
 → @param {String} [options.id=RibbonPlus.tabName] An unique ID for the tab (e.g. "Ribbon.ListForm.Edit")
 → @param {String} [options.description=""] A description for your tab (when the mouse moves over the tab name then the description will show up)
 → @param {String} [options.cssClass=''] To apply a CSS class to your tab
 → @param {Object} [options.before='Tab Name'] To add this tab before the one called "Tab Name"; by default the tab is added at the end
```

#### addGroup(tabName, groupName, [options])

Permit to add a group of buttons into a tab (e.g. the group "Commit" of tab "Edit" contains two buttons that are "Save" and "Cancel").

```
@param {String} tabName The tab name where the group must be added (e.g. "Edit")
@param {String} groupName The group name (e.g. "Commit")
@param {Object} [options]
 → @param {String} [options.id=RibbonPlus.TabName.GroupName] The unique ID you want for this group
```

#### addButtons(tabName, groupName, buttons)

It will add buttons to the ribbon.

```
@param {String} tabName    The name of the tab where the button must be added (e.g. "Edit")
@param {String} groupName  The name of the group of buttons where the button must be added (e.g. "Commit")
@param {Array} buttons     An array of objects that represents the buttons... Array of 1 element for a big alone button... the array can be upto 3 buttons (see below)
 → @param {String} name     The name for the button (e.g. "Save")
 → @param {String} [description=""] The description will appear when the mouse is over the button (e.g. "By clicking this button your item will be saved into the database")
 → @param {String} [descriptionTitle=buttonName] A title for the description (e.g. "Button to Save your Item")
 → @param {String} [image="/_layouts/15/images/placeholder32x32.png"] If it's a large icon then it must be 32x32, otherwise it's 16x16 for small icons
 → @param {Function} [onclick=function(){}] The action to take when clicking the button
 → @param {Boolean} [small=false] True if it's a small button (in the case there is only 1 item in the array and we want it to be a small button)
 
@example
// to add one big alone button:
rp.addButtons('Edit', 'Commit', [
  {
    name:'Save as a Draft',
  }
]);

// to add three small buttons in the same column:
rp.addButtons('Edit', 'Commit', [
  { name:'Action 1' },
  { name:'Action 2' }
  { name:'Action 3'}
])
```
