/*!
 * RibbonPlus
 * Copyright 2016, Aymeric (@aymkdn)
 * Contact: http://kodono.info
 * Documentation: http://aymkdn.github.com/RibbonPlus/
 * License: MIT License (https://github.com/Aymkdn/RibbonPlus/blob/master/LICENSE)
 */
var RibbonPlus = function() {
  var _this=this;
  this.ribbon = null;
  this.isReady=false;
  this.pageManager = null;
  // we need the page component to associate actions to buttons
  this.RibbonPlusPageComponent = function() {
    this.getId=function() { return "RibbonPlusPageComponent" };
    /* Create an array of handled commands with handler methods */
    this._commands = [];
    this._handledCommands = {};
    this.init=function() {};
    this.getGlobalCommands=function() { return this._commands };
    this.handleCommand=function(commandId, properties, sequence) {
      return this._handledCommands[commandId].handler(commandId, properties, sequence);
    };
    this.canHandleCommand=function() { return true };
    this.isFocusable=function() {
      // it's required, even if I don't know what it's doing
      return false;
    }
  };

  /**
   * Make sure the ribbon is ready
   *
   * @param  {Function} fct The function to call when the ribbon is ready
   */
  this.ready = function(fct) {
    var initRibbon = function() {
      try {
        _this.pageManager = SP.Ribbon.PageManager.get_instance();
        _this.pageManager.add_ribbonInited(function () {
          _this.ribbon = (SP.Ribbon.PageManager.get_instance()).get_ribbon();
          if (!_this.isReady) {
            _this.isReady=true;
            fct.call(_this);
          }
        });
        var ribbon = null;
        try { ribbon = _this.pageManager.get_ribbon() } catch (e) { reject(e) }
        if (!ribbon) {
          if (typeof (_ribbonStartInit) == "function") {
            _ribbonStartInit(_ribbon.initialTabId, false, null);
            setTimeout(function() { initRibbon() }, 1500);
          }
        } else {
          _this.ribbon = (SP.Ribbon.PageManager.get_instance()).get_ribbon();
          if (!_this.isReady) {
            _this.isReady=true;
            fct.call(_this);
          }
        }
      } catch(e) { reject(e) }
    }
    SP.SOD.executeOrDelayUntilScriptLoaded(function () {
      initRibbon();
    }, "sp.ribbon.js");
  };
  

  /**
   * Permits to create a new Tab into the Ribbon
   * @param {String} tabName The tab name that appears at the top of the ribbon (e.g. "Edit")
   * @param {Object} [options]
   *   @param {String} [options.id=RibbonPlus.tabName] An unique ID for the tab (e.g. "Ribbon.ListForm.Edit")
   *   @param {String} [options.description=""] A description for your tab (when the mouse moves over the tab name then the description will show up)
   *   @param {String} [options.cssClass=''] To apply a CSS class to your tab
   *   @param {Boolean} [options.contextual=false] I don't know what this is supposed to do
   *   @param {String} [options.contextualGroupId=''] I don't know what this is supposed to do
   *   @param {Object} [options.before='Tab Name'] To add this tab before the one called "Tab Name"; by default the tab is added at the end
   */
  this.addTab=function(tabName, options) {
    if (!tabName || typeof tabName !== "string") throw new Error("[RibbonPlus.addTab] The `tab name` is required.");
    if (!options) options={};
    // if no `id` then create one
    if (!options.id) options.id = "RibbonPlus." + tabName.replace(/\W/g,"");
    if (!options.contextual) options.contextual=false;

    var tabs, i, title, tab, tabAdded=false;
    var list, otabs, obj, otab, otabPrevious;

    // id, title, description, command, contextual, contextualGroupId, cssClass
    var tab = new CUI.Tab(this.ribbon, options.id, tabName, options.description||"", options.id+".Command", options.contextual, options.contextualGroupId, null, null);
    
    // position for the new tab
    if (!options.before) this.ribbon.addChild(tab);
    else {
      // go thru the tabs to find the position index
      for (list in _this.ribbon) {
        if (_this.ribbon.hasOwnProperty(list) && _this.ribbon[list] instanceof CUI.List) {
          tabs = _this.ribbon[list].getEnumerator();
          i = 0;
          while (tabs.moveNext()) {
            otab = tabs.get_current();
            title = otab.get_title();
            if (title.toLowerCase() === options.before.toLowerCase()) {
              _this.ribbon.addChildAtIndex(tab, i);
              // the addChildAtIndex is buggy in Sharepoint, so we need to fix it if we want to add more tabs at a position
              // actually each tab has a `previous` and `next` node, and when we add a node at a position it's supposed to reorder the previous/next
              // but the Sharepoint code is buggy so we need to do it by ourself!
              otabs = _this.ribbon[list];
              for (obj in otabs) {
                if (otabs.hasOwnProperty(obj) && otabs[obj] instanceof CUI.ListNode && !otabs[obj].previous) {
                  otab = otabs[obj];
                  do {
                    if (otab.previous) otab.previous = otabPrevious;
                    otabPrevious = otab;
                  } while((otab = otab.next) !== null);
                }
              }

              tabAdded=true;
              break;
            }

            i++;
          }
        }
      }
      if (!tabAdded) _this.ribbon.addChild(tab);
    }

    // refresh UI
    _this.ribbon.refresh();
  };

  /**
   * Permit to add a group of buttons into a tab (e.g. the group "Commit" of tab "Edit" contains two buttons that are "Save" and "Cancel")
   * @param {String} tabName The tab name where the group must be added (e.g. "Edit")
   * @param {String} groupName The group name (e.g. "Commit")
   * @param {Object} [options]
   *   @param {String} [options.id=RibbonPlus.TabName.GroupName] The unique ID you want for this group
   */
  this.addGroup = function(tabName, groupName, options) {
    var tab, group;

    if (!tabName || !groupName) throw new Error("[RibbonPlus.addGroup] Arguments are required.");
    if (!options) options={};
    tab = _this.ribbon.getChildByTitle(tabName);
    if (!tab) throw new Error("[RibbonPlus.addGroup] The tab with the name `"+tabName+"` doesn't exist.");

    // if no `id` then create one
    if (!options.id) options.id = tab.get_id() + "." + groupName.replace(/\W/g,"");

    // ribbon, id, title, description, command, properties
    group = new CUI.Group(_this.ribbon, options.id, groupName, '', '', null);
    tab.addChild(group);
    _this.ribbon.refresh();
  };

  /**
   * It will add buttons to the ribbon
   *
   * @param {String} tabName    The name of the tab where the button must be added (e.g. "Edit")
   * @param {String} groupName  The name of the group of buttons where the button must be added (e.g. "Commit")
   * @param {Array} buttons     An array of objects that represents the buttons... Array of 1 element for a big alone button... the array can be upto 3 buttons (see below)
   *   @param {String} name     The name for the button (e.g. "Save")
   *   @param {String} [description=""] The description will appear when the mouse is over the button (e.g. "By clicking this button your item will be saved into the database")
   *   @param {String} [descriptionTitle=buttonName] A title for the description (e.g. "Button to Save your Item")
   *   @param {String} [cssClass=""] Add the CSS class to the icon
   *   @param {String} [image="/_layouts/15/images/placeholder32x32.png"] If it's a large icon then it must be 32x32, otherwise it's 16x16 for small icons
   *   @param {Function} [onclick=function(){}] The action to take when clicking the button
   *   @param {Boolean} [small=false] True if it's a small button (in the case there is only 1 item in the array and we want it to be a small button)
   *
   * @example
   * // to add one big alone button:
   * rp.addButtons('Edit', 'Commit', [
   *   {
   *     name:'Save as a Draft',
   *   }
   * ]);
   * // to add three small buttons in the same column:
   * rp.addButtons('Edit', 'Commit', [
   *   { name:'Action 1' },
   *   { name:'Action 2' }
   *   { name:'Action 3'}
   * ])
   */
  this.addButtons = function(tabName, groupName, buttons) {
    if (!tabName || !groupName || !buttons) throw new Error("[RibbonPlus.addButtons] Arguments are required.");
    if (Object.prototype.toString.call(buttons) !== '[object Array]') throw new Error("[RibbonPlus.addButtons] `buttons` must be an array.");

    // we need to create a layout
    var layout, group, section, buttonsLength=buttons.length;
    var tab, list, listNode, controlProperties, button, controlComponent, row;

    if (buttons.length > 3) throw new Error("[RibbonPlus.addButtons] You cannot add more than 3 (small) buttons at a time.");

    // we want to retrieve a group
    tab = _this.ribbon.getChildByTitle(tabName);
    if (!tab) throw new Error("[RibbonPlus.addButton] The tab with the name `"+tabName+"` doesn't exist.");

    for (list in tab) {
      if (tab.hasOwnProperty(list) && tab[list] instanceof CUI.List) {
        // now try to find the group
        group = tab.getChildByTitle(groupName);
        if (!group) throw new Error("[RibbonPlus.addButton] The group `"+groupName+"` cannot be found in the tab `"+tabName+"`.");

        // check if we have a layout, other add a new layout into the group
        layout = group.get_selectedLayout();
        if (!layout) {
          //CUI.Layout = function(ribbon, id, title)
          //layout = new CUI.Layout(_this.ribbon, id, 'Foo.Layout');
          layout = new CUI.Layout(_this.ribbon, "RibbonPlus.Layout.Id." + (new Date().getTime()), "RibbonPlus.Layout.Title." + (new Date().getTime()));
          group.addChild(layout);
        }

        // create the section
        // "type" => 2 (one row = one icon), 3 (two rows = two icons), 4 (three rows = three icons)
        // "alignment" is not really useful
        // CUI.Section = function(ribbon, id, type, alignment)
        section = new CUI.Section(_this.ribbon, 'RibbonPlus.Section.'+(new Date().getTime()), buttonsLength + 1, 0);
        layout.addChild(section);

        var rpPC = new _this.RibbonPlusPageComponent();

        for (i=0; i < buttonsLength; i++) {
          buttons[i].id = "RibbonPlus."+tabName.replace(/\W/g,"")+"."+groupName.replace(/\W/g,"")+"."+buttons[i].name.replace(/\W/g,"");
          if (buttonsLength === 1) buttons[i].small = (buttons[i].small ? true: false);
          else buttons[i].small = true;

          if (typeof buttons[i].onclick !== "function") buttons[i].onclick=function(){};
          controlProperties = new CUI.ControlProperties();
          controlProperties.Command = buttons[i].id + ".Command";
          controlProperties.Id = buttons[i].id + ".ControlProperties";
          controlProperties.TemplateAlias = 'o1';
          controlProperties.ToolTipDescription = buttons[i].description || "";
          if (buttons[i].small) {
            controlProperties.Image16by16 = buttons[i].image || '/_layouts/15/images/discussHS.png';
            controlProperties.Image16by16Class = buttons[i].cssClass || "";
          } else {
            controlProperties.Image32by32 = buttons[i].image || '/_layouts/15/images/placeholder32x32.png';
            controlProperties.Image32by32Class = buttons[i].cssClass || "";
          }
          controlProperties.ToolTipTitle = buttons[i].descriptionTitle || buttons[i].name;
          controlProperties.LabelText = buttons[i].name || "Unnamed";

          // function(commandId, props, seq) {}
          rpPC._handledCommands[controlProperties.Command] = {
            handler:buttons[i].onclick
          };
          rpPC._commands.push(controlProperties.Command);

          buttons[i].button = new CUI.Controls.Button(_this.ribbon, buttons[i].id, controlProperties);
          controlComponent = buttons[i].button.createComponentForDisplayMode(buttons[i].small ? 'Medium' : 'Large');
          row = section.getRow(i+1);
          row.addChild(controlComponent);
        }

        group.selectLayout(layout.get_title());
        break;
      }
    }

    _this.pageManager.addPageComponent(rpPC);

    // enable the buttons
    SelectRibbonTab(tab.get_id(), true);
    for (i=0; i<buttonsLength; i++) buttons[i].button.set_enabled(true);
    _this.ribbon.refresh();
  }

  // CUI.Ribbon --> CUI.Tab --> CUI.Group --> CUI.Layout --> CUI.Section --> CUI.Row --> CUI.Controls.Button
}
