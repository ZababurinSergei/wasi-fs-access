let config = {}

config['now'] = 'http://localhost:3000'

config['mongo'] = {}
config['mongo']['web'] = 'https://mongo.zababurinsv.now.sh'
config['mongo']['local'] = 'http://localhost:3003'
config['mongo']['cell'] = 'https://mongo.zababurinsv.now.sh'

config['waves'] = {}
config['waves']['web'] = 'https://waves.zababurinsv.now.sh'
config['waves']['local'] = 'http://localhost:3005'
config['waves']['cell'] = 'https://waves.zababurinsv.now.sh'

config['rington'] = {}
config['rington']['local'] = 'http://localhost:5007'
config['rington']['web'] = 'https://rington-messenger.herokuapp.com'
config['rington']['now'] = 'http://localhost:3000'
config['rington']['ws'] = 'ws://localhost:7000'

config['vk'] = {}
config['vk']['web'] = 'https://vk.szababurinv.now.sh/'
config['vk']['local'] = 'http://localhost:4554/'
config['vk']['cell'] = 'https://vk.szababurinv.now.sh/'

config['facebook'] = {}
config['facebook']['web'] = 'https://authorization-facebook.now.sh/'
config['facebook']['local'] = 'http://localhost:5009/'
config['facebook']['dev'] = 'http://localhost:3000/'

config['twitter'] = {}
config['twitter']['web'] =    'https://rington-radio.herokuapp.com'
config['twitter']['local'] =  'http://localhost:4731'
config['twitter']['dev'] =    'http://localhost:3000'

config['store'] = {}
config['store']['web'] = 'https://webdav2.zababurinsv.now.sh'
config['store']['local'] = 'http://localhost:4000'

config['email'] = {}
config['email']['web'] = 'https://email.zababurinsv.now.sh'
config['email']['local'] = 'http://localhost:3007'
config['waves']['cell'] = 'https://email.zababurinsv.now.sh'

config['telegram'] = {}
config['telegram']['localHttp'] = 'https://localhost:7000'
config['telegram']['localWss'] = 'wss://localhost:7000'
config['telegram']['localSse'] = 'wss://localhost:7000/connect'
config['telegram']['web'] = 'https://rington-messenger.herokuapp.com'
config['telegram']['wss'] = 'wss://rington-messenger.herokuapp.com'
config['telegram']['sse'] = 'https://rington-messenger.herokuapp.com/connect'

config['ton'] = {}
config['ton']['local'] = 'ws://localhost:7777'
config['ton']['web'] = 'ws://localhost:7777'
config['ton']['ws'] = 'ws://localhost:7777'

config['authorization'] = {}
config['authorization']['local'] = 'ws://localhost:7007'
config['authorization']['web'] = 'ws://localhost:7007'
config['authorization']['ws'] = 'ws://localhost:7007'


config['template'] = {}
config['template']['web'] = 'http://localhost:9999'
config['template']['local'] = 'http://localhost:9999'
config['template']['cell'] = 'http://localhost:9999'



config['account'] = {}
config['account']['local'] = 'http://localhost:3009'
config['account']['web'] = 'https://account.zababurinsv.now.sh'
config['account']['cell'] = 'https://account.zababurinsv.now.sh'
config['account']['dapp'] = '3N8n4Lc8BMsPPyVHJXTivQWs7ER61bB7wQn'
config['account']['this'] = `${config['account']['dappaddress']}?matches=`
config['account']['testnodes'] = 'https://testnodes.wavesnodes.com'
config['account']['sse'] = 'https://account.zababurinsv.now.sh/stream'


export default async (account = 'template',type='cell')=>{
    return config[`${account}`][`${type}`]
}
