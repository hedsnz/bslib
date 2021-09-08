import { tag, tagList, HTML, appendChild } from './utils';

function createTabFragment(self, className, tabset) {
    const ulAttrs = {
        class: className, 
        role: 'tablist', 
        'data-tabsetid': tabset.id
   };

    const id = self.getAttribute('id');
    if (id) {
        ulAttrs.id = id;
        ulAttrs.class = ulAttrs.class + ' shiny-tab-input';
    }

    const ulTag = tag('ul', ulAttrs, tabset.tabList);
    
    // TODO: should we be wrapping in a row?
    let contents = [];
    const header = self.getAttribute('header');
    if (header) contents.push(HTML(header));
    contents.push(tabset.tabContent);
    const footer = self.getAttribute('footer');
    if (footer) contents.push(HTML(footer));

    const divTag = tag(
        'div', {class: 'tab-content', 'data-tabsetid': tabset.id},
        contents
    );
    
    return tagList(ulTag, divTag);
}

function buildTabset(navs, selected) {
    // TODO: utilize tagList()!
    let tabList = new DocumentFragment(); 
    let tabContent = new DocumentFragment();
    const id = Math.floor(1000 + Math.random() * 9000);
    for (var i = 0; i < navs.length; i++) {
        let item = buildTabItem(navs[i], selected, id, i+1);
        // .nav-content doesn't need liTag
        tabList.append(item.liTag);
        // .nav-item/.nav-spacer don't have divTag
        if (item.divTag) tabContent.append(item.divTag);
    }
    return {tabList, tabContent, id}
}

function buildTabItem(nav, selected, id, index) {
    let liTag = document.createElement('li');
    //liTag.classList.add('nav-item');
    
    if (nav.classList.contains('nav-spacer')) {
        liTag.classList.add('bslib-nav-spacer');
        return {liTag, divTag: undefined};
    }
    
    if (nav.classList.contains('nav-item')) {
        // TODO: drop form-inline since BS5 dropped it?
        // If we do that do we need bslib-navs-bar to generate valid BS5 markup?
        liTag.classList.add('form-inline');
        liTag.append(nav.content);
        
        return {liTag, divTag: undefined};
    }
    
    if (nav.classList.contains('nav-menu')) {
        liTag.classList.add('dropdown');
        
        const attrs = {
            href: '#', class: 'dropdown-toggle', 
            'data-toggle': 'dropdown', 
            'data-value': nav.getAttribute('value')
        };

        let toggle = tag('a', attrs, HTML(nav.getAttribute('title')));
        //toggle.classList.add('nav-link');
        
        let menu = tag('ul', {'data-tabsetid': id, class: 'dropdown-menu'});
        if (nav.getAttribute('align') === 'right') {
            menu.classList.add('dropdown-menu-right');
        }
        
        let navMenu = buildTabset(nav.content.children, selected);
        
        //navMenu.tabList.children.forEach(x => {
        //  x.classList.remove('nav-item')
        //  let link = x.querySelector('.nav-link');
        //  link.classList.remove('nav-link');
        //  link.classList.add('dropdown-item');
        //})
        
        menu.append(navMenu.tabList);
        liTag.append(toggle);
        liTag.append(menu);
        
        return {liTag, divTag: navMenu.tabContent};
    }
    
    if (nav.classList.contains('nav')) {
        const tabId = `tab-${id}-${index}`;
        // NOTE: this should really be <button> (not <a>), but Shiny's
        // tab updating logic would need updating to support that
        // NOTE: requires compatibility layer...
        //aTag.classList.add('nav-link');

        let aTag = tag(
          'a', {href: '#' + tabId, role: 'tab', 'data-toggle': 'tab', 'data-value': nav.getAttribute('value')},
          HTML(nav.getAttribute('title'))
        );
        
        liTag.append(aTag);
        
        let divTag = tag(
            'div', {id: tabId, class: 'tab-pane', role: 'tabpanel'},
            nav.content
        );
        
        // NOTE: requires compatibility layer...
        // Calling tab.show() would be better, but probably has to be inserted into DOM to work?
        if (selected === nav.getAttribute('value')) {
            liTag.classList.add('active');
            divTag.classList.add('active');
        }
        
        return {liTag, divTag};
    }
    
    throw new Error(`A 'top-level' <${name}> tag within <bslib-navs-tab> is not supported`);
}

function getSelected(self) {
    let selected = self.getAttribute('selected');
    if (!selected) {
        selected = findFirstNav(self.children).getAttribute('value');
    }
    return selected;
}

function findFirstNav(navs) {
    for (var i = 0; i < navs.length; i++) {
        let nav = navs[i];
        if (nav.classList.contains('nav')) {
            return nav;
        }
        if (nav.classList.contains('nav-menu')) {
            findFirstNav(nav);
        }
    }
}

function replaceChildren(x, y) {
    while (x.firstChild) {
        x.removeChild(x.lastChild);
    }
    appendChild(x, y);
}

export { 
    createTabFragment, 
    buildTabset,
    getSelected,
    replaceChildren
}