chrome.storage.local.get(['ApiKey', 'DBID'], (result) => {
  NOTION_TOKEN = result.ApiKey || '';
  DATABASE_ID = result.DBID || '';
  console.log(NOTION_TOKEN);
  console.log(DATABASE_ID);
  // TODO: 値がストレージに保存されていない場合はエラーメッセージを表示し、保存されている場合はmain関数をここで実行する
});

function main() {
  let exhibitions = document.querySelectorAll("div.exhiBody");

  for (let i = 0; i < exhibitions.length; i++) {
    let exhibition = exhibitions[i];

    // button要素を作成
    let button = document.createElement("input");
    button.type = "button";
    button.value = "Notion登録";

    // イベントリスナーを追加
    button.addEventListener("click", function () {
      let title = this.closest(".exhiBody")
        .querySelector("h3.headH3D")
        .textContent.trim();
      let museum = exhibition
        .querySelector("ul.infoList.on li span")
        .textContent.trim();
      let Date = exhibition.querySelector("p.exhiDate").textContent.trim();
      console.log(Date);

      addItem(title, museum, Date);
    });

    // buttonを要素に追加
    let element = document.createElement("table");
    element.appendChild(button);
    exhibition.appendChild(element);
  }
}

function formatDate(Date) {
  // const str = "2023年02月11日～2023年05月06日（予約制）"; Date の example
  const startdate_startindex = Date.indexOf("2"); // 西暦2XXX年代
  const startdate_endindex = Date.indexOf("日") + 1;
  const enddate_startindex = Date.indexOf("日") + 2;
  const enddate_endindex = Date.lastIndexOf("日") + 1;

  startdate = Date.substring(startdate_startindex, startdate_endindex);
  enddate = Date.substring(enddate_startindex, enddate_endindex);

  let formattedStartDate = startdate.replace(/年|月/g, "-").replace(/日/, "");
  let formattedEndDate = enddate.replace(/年|月/g, "-").replace(/日/, "");
  return [formattedStartDate, formattedEndDate];
}

async function addItem(title, museum, Date) {
  // chrome.runtimeを介してbackground.jsへNotion APIリクエストを送る
  console.log(Date);
  let [formattedStartDate, formattedEndDate] = formatDate(Date);
  chrome.runtime.sendMessage(
    {
      action: "sendToNotion",
      api_key: NOTION_TOKEN,
      payload: {
        parent: {
          database_id: DATABASE_ID,
        },
        properties: {
          Title: {
            // 列名
            title: [
              {
                text: {
                  // "content": "クリスチャン・ディオール、 夢のクチュリエ"
                  content: title,
                },
              },
            ],
          },
          Date: {
            // 列名
            date: {
              start: `${formattedStartDate}`,
              end: `${formattedEndDate}`,
            },
          },
          Museum: {
            // 列名
            multi_select: [{ name: museum }],
          },
          endDate: {
            // 列名 終了日順にソートするために必要
            date: {
              start: `${formattedEndDate}`,
              end: null,
            },
          },
        },
      },
    },
    (response) => {
      if (response.success) {
        console.log("データがNotionに追加されました。");
        let properties = response.json_response.properties;
        let period = properties.Date.date;
        let museum = properties.Museum.multi_select[0].name;
        let title = properties.Title.title[0].plain_text;
        alert(
          "Notionに以下の内容を登録" +
            "\n" +
            "タイトル: " +
            title +
            "\n" +
            "場所: " +
            museum +
            "\n" +
            "開催期間: " +
            period.start +
            " 〜 " +
            period.end
        );
      } else {
        alert("データの追加に失敗しました。" + response.error);
      }
    }
  );
}

main();
