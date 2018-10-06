const domUtils = {
  doesNodeContainClick: (node, e) => {
    if (!node || !e) return false;

    if (node.contains(e.target)) return true;
  }
};

export default class Navigation {
  constructor({ selector }) {
    this.menuOpened = false;
    this.headerMenu = document.querySelector(selector);
    this.headerBurgerMenu = document.querySelector("#header-burger");

    if (this.isMobile()) {
      this.initNavigation();
    }
  }

  isMobile() {
    const maxMobileWidth = 768;

    return window.innerWidth < maxMobileWidth;
  }

  initNavigation() {
    this.headerMenu.classList.add("header-menu-list_state-mobile");

    this.headerBurgerMenu.addEventListener("click", () => {
      if (!this.menuOpened) {
        this.openNavigation();
      } else {
        this.closeNavigation();
      }
    });
  }

  openNavigation() {
    this.headerMenu.classList.add("header-menu-list_state-mobile-opened");

    this.menuOpened = true;
  }

  closeNavigation() {
    this.headerMenu.classList.remove("header-menu-list_state-mobile-opened");

    this.menuOpened = false;
  }
}
