# Instagram Posts Grabber [deprecated, not working]

### Grabs instagram user's last posts & downloads if needed 
## Installing

```sh
$ npm i instagram-posts-grabber
```



## Methods

### .launchBrowser()
### .authorize()
### .parseAccount(account, count, path)



## Usage

```js
const instaGrabber = require('instagram-posts-grabber');
const parser = new instaGrabber('examplemail@gmail.com', 'examplepass');

parser.launchBrowser().then(function() {
	parser.parseAccount('exampleuser', 10, './').then(function(data) {
  		console.log(data);
	}).catch(function() {
  		console.log('[error] while parsing');
	});
}).catch(function() {
 	console.log('[error] while logging');
});
```
