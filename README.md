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
