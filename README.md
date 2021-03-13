# twitter-api-client-test

Twitter API、Twitter-api-clientの素振り用リポジトリです。
特定アカウントのツイートをAPIの最大件数（2021/03/13現在は3200件）まで取得して、csvに出力します。


.envファイルを作成して、下記を設定（Twitter Developer登録が必要）
```
API_KEY=
API_SECRET=
ACCESS_TOKEN=
ACCESS_TOKEN_SECRET=
```

```
yarn install
node index.js
```
