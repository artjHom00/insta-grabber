const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

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
        defaultViewport: {
          "width": 1920,
          "height": 1080
        }
      });
      this.page = await browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
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
  async parseAccount(account, count = 10, downloadPath = false) {
    return new Promise(async (resolve, reject) => {
      await this.page.goto(`https://www.instagram.com/${account}/`, {
        waitUntil: 'networkidle2'
      });
      await this.page.waitForSelector('.v1Nh3.kIKUG', {
        timeout: 0
      }).then(async () => {
        let posts = await this.page.evaluate((count) => {
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
        }, count);
        for(let i = 0; i < posts.length; i++) {
          await this.page.goto(posts[i] + '?__a=1', {waitUntil: 'networkidle2'});
          let source = await this.page.evaluate(function() {
            try {
              let url = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.edge_sidecar_to_children.edges[1].node.video_url;
              let type = 'video'
              if(!url) {
                url = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.display_resources[2].src;
                type = 'photo'
              }
              let caption = null;
              try {
                caption = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
              } catch {
                caption = '';
              }
              let timestamp = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.taken_at_timestamp;
              let shortcode = JSON.parse(document.querySelector('pre').textContent).graphql.shortcode_media.shortcode;
              return {
                url,
                type,
                caption,
                timestamp,
                shortcode
              };
            } catch {
              return false;
            }
          });
          if(source) {
            await this.parsed.push(source);
          }
        }
        if(downloadPath) {
          for(let i = 0; i < this.parsed.length; i++) {
            await this.downloadFile(this.parsed[i].url, downloadPath, this.parsed[i].shortcode + (this.parsed[i].type == 'video' ? '.mp4' : '.png'))
          }
        }
        resolve(this.parsed);
      });
    });
  }
  async downloadFile(fileUrl, downloadFolder, fileName) {
    const localFilePath = path.resolve(downloadFolder, fileName);
    try {
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      });
  
      response.data.pipe(fs.createWriteStream(localFilePath));
    } catch (err) {
      throw new Error(err);
    }
  }; 
} 
