"use strict";
chrome.storage.local.get(["ApiKey", "DBID"], (result) => {
    NOTION_TOKEN = result.ApiKey || "";
    DATABASE_ID = result.DBID || "";
    console.log(NOTION_TOKEN);
    console.log(DATABASE_ID);
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
            console.log("タイトル" + title);
            let museum = exhibition
                .querySelector("h3.article-title + p")
                .textContent.trim();
            console.log("美術館" + museum);
            let Date = exhibition.querySelector("h3.article-title + p + p").textContent.trim();
            console.log("期間" + Date);
            addItem(title, museum, Date);
        });
        let element = document.createElement("table");
        element.appendChild(button);
        exhibition.appendChild(element);
    }
}
function formatDate(Date) {
    var RawDates = Date.match(/(\d{4}年\d{1,2}月\d{1,2}日)/g);
    var formattedDates = RawDates.map((dateString) => {
        return dateString.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/, (match, year, month, day) => {
            return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        });
    });
    return formattedDates;
}
async function addItem(title, museum, Date) {
    let [formattedStartDate, formattedEndDate] = formatDate(Date);
    chrome.runtime.sendMessage({
        action: "sendToNotion",
        api_key: NOTION_TOKEN,
        payload: {
            parent: {
                database_id: DATABASE_ID,
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
                Date: {
                    date: {
                        start: `${formattedStartDate}`,
                        end: `${formattedEndDate}`,
                    },
                },
                Museum: {
                    multi_select: [{ name: museum }],
                },
                endDate: {
                    date: {
                        start: `${formattedEndDate}`,
                        end: null,
                    },
                },
            },
        },
    }, (response) => {
        if (response.success) {
            console.log(response);
            console.log("データがNotionに追加されました。");
            let properties = response.json_response.properties;
            let period = properties.Date.date;
            let museum = properties.Museum.multi_select[0].name;
            let title = properties.Title.title[0].plain_text;
            alert("Notionに以下の内容を登録" +
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
                period.end);
        }
        else {
            alert("データの追加に失敗しました。" + response.error);
        }
    });
}
main();
