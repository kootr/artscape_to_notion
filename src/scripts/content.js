chrome.storage.local.get(["ApiKey", "DBID"], (result) => {
  NOTION_TOKEN = result.ApiKey || "";
  DATABASE_ID = result.DBID || "";
  // console.log(NOTION_TOKEN);
  // console.log(DATABASE_ID);
  // TODO: 値がストレージに保存されていない場合はエラーメッセージを表示し、保存されている場合はmain関数をここで実行する
});

function main() {
  let exhibitions = document.querySelectorAll(".item-article.item-exhibitions");

  for (let i = 0; i < exhibitions.length; i++) {
    let exhibition = exhibitions[i];
    let button = document.createElement("input");
    button.type = "button";
    button.value = "Notion登録";

    button.addEventListener("click", function () {
      let title = exhibition
        .querySelector("h3.article-title a span")
        .textContent.trim();
      let museum = exhibition
        .querySelector("h3.article-title + p")
        .textContent.trim();
      let Date = exhibition.querySelector("h3.article-title + p + p").textContent.trim();

      addItem(title, museum, Date);
    });
    // buttonを要素に追加
    let element = document.createElement("table");
    element.appendChild(button);
    exhibition.appendChild(element);
  }
}

function formatDate(Date) {
  // const Date = "2023年02月11日～2023年05月06日（予約制）"; Example 1
  // const Date = "2023年2月1日(日)～2023年5月6日(日)"; Example 2
  var RawDates = Date.match(/(\d{4}年\d{1,2}月\d{1,2}日)/g);

  var formattedDates = RawDates.map((dateString) => {
    return dateString.replace(
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      (match, year, month, day) => {
        return `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      }
    );
  });

  return formattedDates; // [2023-02-01, 2023-05-06]
}

async function addItem(title, museum, Date) {
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
          "Title": {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          Museum: {
            multi_select: [{ name: museum }],
          },
          Date: {
            date: {
              start: formattedStartDate,
              end: formattedEndDate,
            },
          },
          endDate: {
            date: {
              start: formattedEndDate,
              end: null,
            },
          },
        },
      },
    },
    (response) => {
      if (response.success) {
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
