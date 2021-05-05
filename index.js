console.clear();
const puppeteer = require('puppeteer');

module.exports = class instagramGrabber {
  constructor(login, password) {
    this.login = login;
    this.password = password;
    this.parsed = [];
    this.page = null
  }
  async launchBrowser() {
    return new Promise(async (resolve, reject) => {
      const browser = await puppeteer.launch({
        "headless": false
      });
      this.page = await browser.newPage();
      await resolve();
    });
  }
  async authorize() {
    return new Promise(async (resolve, reject) => {
      await this.launchBrowser().then(async () => {
        await this.page.goto('https://instagram.com/accounts/login/');
          await this.page.waitForSelector('.SCxLW').then(async () => {  
            await this.page.waitForSelector('input[name="username"]');
            await this.page.type('input[name="username"]', this.login);
            await this.page.type('input[name="password"]', this.password);
            await this.page.click('button[type="submit"]');
            await resolve();    
        });
      });
    });
  }
  async parseAccount(account, count) {
    return new Promise(async (resolve, reject) => {
      await this.page.goto(`https://www.instagram.com/${account}/`);
      await this.page.waitForSelector('.v1Nh3.kIKUG', {
        timeout: 0
      }).then(async () => {
        let posts = await this.page.evaluate(function() {
          arr = [];
          i = 0
          document.querySelectorAll('.v1Nh3.kIKUG').forEach(function(el) {
            if(i < count) {
              arr.push(el.children[0].href);
              i += 1
            } else {
              return false;
            }
          });
          return arr;
        });
        for(let i = 0; i < posts.length; i++) {
          await this.page.goto(posts[i] + '?__a=1', {waitUntil: 'networkidle2'});
          let sourceUrl = await this.page.evaluate(function() {
            try {
              let source = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.edge_sidecar_to_children.edges[1].node.video_url
              if(!source) {
                source = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.display_resources[2].src
              }
              return source;
            } catch {
              return false;
            }
          });
          this.parsed.push(sourceUrl);
        }
        resolve(this.parsed);
      });
    });
  }
} 
