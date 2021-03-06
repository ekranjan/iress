/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
(function() {
  let tablist = document.querySelectorAll("[role='tablist']")[0];
  let tabs;
  let panels;
 // let delay;

  let generateArrays = () => {
    tabs = document.querySelectorAll("[role='tab']");
    panels = document.querySelectorAll("[role='tabpanel']");
  }
  generateArrays();  
  // For easy reference
  let keys = {
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    delete: 46
  };

  // Add or substract depending on key pressed
  let direction = {
      37: -1,
      38: -1,
      39: 1,
      40: 1
  };

  // Bind listeners

  let updateUrl = (tab) => {
    var controls = tab.getAttribute("aria-controls");
    var path = location.href= "#" + controls;
  }

  let loadEventListener = () => {
      var currentPath=window.location;
      var pathString = String(currentPath);
      var hashString =pathString.split("#")[1];
      //var x = document.querySelectorAll('[role="tab"]');
      //alert(tabs);
      //alert(x);
        for(var p=0; p<=tabs.length -1; ++p){
           var currentTab = (tabs[p].getAttribute("aria-controls"));
            if(currentTab === hashString){
                activateTab(tabs[p]);
            }
        }
  }

  let funcRef = () => {
      location.reload();
  }

 // When a tab is clicked, activateTab is fired to activate it
  let clickEventListener = (event) => {
    var tab = event.target;
    activateTab(tab, false);
    updateUrl(tab);
  };
  
  // Handle keydown on tabs
  let keydownEventListener = (event) => {
    var key = event.keyCode;

    switch (key) {
      case keys.end:
        event.preventDefault();
        // Activate last tab
        activateTab(tabs[tabs.length - 1]);
        break;
      case keys.home:
        event.preventDefault();
        // Activate first tab
        activateTab(tabs[0]);
        break;

      // Up and down are in keydown
      // because we need to prevent page scroll >:)
      case keys.up:
      case keys.down:
        determineOrientation(event);
        break;
    };
  };

  // Handle keyup on tabs
  let keyupEventListener = (event) => {
    var key = event.keyCode;

    switch (key) {
      case keys.left:
      case keys.right:
        determineOrientation(event);
        break;
      case keys.delete:
        determineDeletable(event);
        break;
    };
  };
  
  

  let addListeners = (index) => {
    tabs[index].addEventListener("click", clickEventListener);
    tabs[index].addEventListener("keydown", keydownEventListener);
    tabs[index].addEventListener("keyup", keyupEventListener);
    window.addEventListener("load", loadEventListener);
    window.addEventListener("hashchange", funcRef, false);

    // Build an array with all tabs (<button>s) in it
    tabs[index].index = index;
  }
    for (let i = 0; i < tabs.length; ++i) {
    addListeners(i);
  };


  // When a tablistâ€™s aria-orientation is set to vertical,
  // only up and down arrow should function.
  // In all other cases only left and right arrow function.
  let determineOrientation = (event) => {
    let key = event.keyCode;
    let vertical = tablist.getAttribute("aria-orientation") == "vertical";
    let proceed = false;

    if (vertical) {
      if (key === keys.up || key === keys.down) {
        event.preventDefault();
        proceed = true;
      };
    }
    else {
      if (key === keys.left || key === keys.right) {
        proceed = true;
      };
    };

    if (proceed) {
      switchTabOnArrowPress(event);
    };
  };

  // Either focus the next, previous, first, or last tab
  // depening on key pressed
  let switchTabOnArrowPress = (event) => {
    var pressed = event.keyCode;

    for (let x = 0; x < tabs.length; x++) {
      tabs[x].addEventListener("focus", focusEventHandler);
    };

    if (direction[pressed]) {
      let target = event.target;
      if (target.index !== undefined) {
        if (tabs[target.index + direction[pressed]]) {
          tabs[target.index + direction[pressed]].focus();
        }
        else if (pressed === keys.left || pressed === keys.up) {
          focusLastTab();
        }
        else if (pressed === keys.right || pressed == keys.down) {
          focusFirstTab();
        };
      };
    };
  };

  // Activates any given tab panel
  let activateTab = (tab, setFocus) => {
    setFocus = setFocus || true;
    // Deactivate all other tabs
    deactivateTabs();

    // Remove tabindex attribute
    tab.removeAttribute("tabindex");

    // Set the tab as selected
    tab.setAttribute("aria-selected", "true");
    //location.href='?'  + tab.id;


    // Get the value of aria-controls (which is an ID)
    let controls = tab.getAttribute("aria-controls");
    
    // Remove hidden attribute from tab panel to make it visible
    document.getElementById(controls).removeAttribute("hidden");
    // Set focus when required
    if (setFocus) {
      tab.focus();
    };
  };

  // Deactivate all tabs and tab panels
    let deactivateTabs = () => {
    for (let t = 0; t < tabs.length; t++) {
      tabs[t].setAttribute("tabindex", "-1");
      tabs[t].setAttribute("aria-selected", "false");
      tabs[t].removeEventListener("focus", focusEventHandler);
    };

    for (let p = 0; p < panels.length; p++) {
        panels[p].setAttribute("hidden", "hidden");
    };
  };

  // Focus on first tab
  let focusFirstTab = () => {
    tabs[0].focus();
  };

  // Focus on last tab
  let focusLastTab = () => {
    tabs[tabs.length - 1].focus();
  };

  // Detect if a tab is deletable
 let determineDeletable = (event) => {
    target = event.target;

    if (target.getAttribute("data-deletable") !== null) {
      // Delete target tab
      deleteTab(event, target);

      // Update arrays related to tabs widget
      generateArrays();

      // Activate the closest tab to the one that was just deleted
      if (target.index - 1 < 0) {
        activateTab(tabs[0]);
      }
      else {
        activateTab(tabs[target.index - 1]);
      };
    };
  };

  // Deletes a tab and its panel
  let deleteTab = (event) => {
    let target = event.target;
    let panel = document.getElementById(target.getAttribute("aria-controls"));

    target.parentElement.removeChild(target);
    panel.parentElement.removeChild(panel);
  };

  // Determine whether there should be a delay
  // when user navigates with the arrow keys
  let determineDelay = () => {
    let hasDelay = tablist.hasAttribute("data-delay");
    let delay = 0;

    if (hasDelay) {
      let delayValue = tablist.getAttribute("data-delay");
      if (delayValue) {
        delay = delayValue;
      }
      else {
        // If no value is specified, default to 300ms
        delay = 300;
      };
    };

    return delay;
  };
    // Only activate tab on focus if it still has focus after the delay
  let checkTabFocus = (target) => {
    focused = document.activeElement;
            updateUrl(focused);


    if (target === focused) {
      activateTab(target, false);
    };
  };
  
  let delay = determineDelay();
  let focusEventHandler = (event) => {
    var target = event.target;
    setTimeout(checkTabFocus, delay, target);
  };


}());