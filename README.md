# Instagram Posts Grabber

### Grabs source links from instagram user's last posts 
## Installing

```sh
$ npm i instagram-posts-grabber
```



## Methods

### .launchBrowser()
### .authorize()
### .parseAccount(account, count)



## Usage

```js
const instaGrabber = require('./index');
const parser = new instaGrabber('examplemail@gmail.com', 'examplepass');

parser.launchBrowser().then(function() {
	parser.parseAccount('exampleuser').then(function(data) {
  		console.log(data);
	}).catch(function() {
  		console.log('[error] while parsing');
	});
}).catch(function() {
 	console.log('[error] while logging');
});
```
