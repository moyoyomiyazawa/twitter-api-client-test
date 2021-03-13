require('dotenv').config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const TwitterClient = require('twitter-api-client').TwitterClient;
const readline = require('readline');

// ユーザーからの入力を取得する Promise を生成する
const readUserInput = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};

const csvWriter = createCsvWriter({
  path: './tweets.csv', // 保存する先のパス(すでにファイルがある場合は上書き保存)
  header: [
    {id:'id_str', title:'Tweet UID'},
    {id:'text', title:'text'},
    {id:'retweet_count', title:'retweet_count'},
    {id:'favorite_count', title:'favorite_count'},
    {id:'created_at',  title:'created_at'},
  ],
});

const twitterClient = new TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});


(async () => {
  const screenName = await readUserInput(
    'twitterのスクリーンネームを入力してください（例：@moyoyomiyazawa）: @'
  );

  const option = {
    screen_name: screenName,
    user_id: '',
    include_rts: false, // RTを含めるかどうか
    exclude_replies: true, // Replyを除くかどうか
    trim_user: true,
    count: 180, // 1度で取得できる最大件数の200だとたまにエラーになるので、180にしておく...
  };

  let tweets = [];
  try {
    for (let i = 0; i < 18; i++) {
      const response = await twitterClient.tweets.statusesUserTimeline(option);
      tweets.push(...response);
      // デバッグ用
      // console.log(response.slice(-1)[0].id_str, i);
      // 取得したツイートの最後のidをそのままmax_idに設定すると、そのツイート自体も含んでしまう
      // idを-1することで、そのツイートを含まずに更に過去のツイートを取得できる
      // BigIntに変換しているのはツイートのidの値がJavaScriptがNumber プリミティブで表現できる最大の数、 Number.MAX_SAFE_INTEGER よりも大きな数値なため
      option.max_id = (
        BigInt(response.slice(-1)[0].id_str) - BigInt(1)
      ).toString();
    }
  } catch (error) {
    console.log(error);
  } finally {
    csvWriter.writeRecords(tweets).then(() => {
      console.log('done');
    });
    // デバッグ用
    // console.dir(tweets, { depth: null });
  }
})();
