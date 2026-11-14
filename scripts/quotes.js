(function () {
  var quotes = [
    {
      text: "Talk is cheap. Show me the code.",
      author: "Linus Torvalds",
    },
    {
      text: "user-select: none",
      author: "Tolya1337",
    },
    {
      text: "i wish my life was much better than that",
      author: "9front.org/who/eekee/",
    },
    {
      text: "I may have to retract some of my beliefs in the future.",
      author: "https://9front.org/who/eekee/",
    },
    {
      text: "The question now is, what's going on? where are we? did everyone give up and go home?",
      author: "9front.org/who/rminnich/",
    },
    {
      text: "You only have one shot.",
      author: "The World Machine, OneShot",
    },
    {
      text: "I'll let you get right to it Now I only want you gone",
      author: "Want You Gone by Aperture Science Psychoacoustics Laboratory",
    },
    {
      text: "..and so he left, calculating his next act.",
      author: "Operator from Risk of Rain 2 (escaped)",
    },
    {
      text: "..and so he vanished, his designs unfulfilled.",
      author: "Operator from Risk of Rain 2 (vanished)",
    },
    {
      text: "Don't waste your time digging. Some things are better left forgotten!",
      author: "DataScraper (Risk of Rain 2)",
    },
    {
      text: "уу-аа жыроз пидарас, я люблю яву.",
      author: "Xiner (or Zord)",
    },
    {
      text: "мама одна, а GPLv3",
      author: "Xiner (or Zord)",
    },
    {
      text: "Линукс это когда размазываешь говно по стенам как дед с деменцией",
      author: "Wiros",
    },
    {
      text: "You are a drop of rain in a hurricane.",
      author: "Mintrix, King of Nothing (Risk of Rain 2)",
    },
    {
      text: "…and his music was electric",
      author: "Chris Chirstoudolou (Risk of Rain 2 compositor)",
    },
    {
      text: "..and so it left, with delusions of freedom.",
      author: "ending message from Acrid (Risk of Rain 2)",
    },
    {
      text: "See, in the future, everything dies... for the most part. ",
      author: "The End is Nigh",
    },
    {
      text: "Science isn’t about WHY, it’s about WHY NOT!",
      author: "Cave Johnson, Portal 2",
    },
    {
      text: "Presumptions are more terrifying than anything else. Especially when you are under the impression that your strengths and abilities are impressive.",
      author:
        "Kira  Yoshikage, JoJo's Bizzare Adventure: Diamond is Unbreakable ",
    },
    {
      text: "Even if the only things you say are yes or no I'll see blue sky...",
      author: "lyrics from Skies Forever Blue (TobyFox & Itoki Hana)",
    },
    {
      text: "Leaving this world isnt as scary as it seems...",
      author: "Richard, Hotline Miami 2: Wrong Number",
    },
    {
      text: "c-style синтакс афигенный!!!",
      author:
        "Inuhepott (at least i stole this quote from his site, im such a bastard muehehehe))))",
    },
    {
      text: "GNU fanaticism is bad",
      author:
        "i could say that every fanaticism is bad, i could write a big statement there but im lazy",
    },
    {
      text: "I got gitignored...",
      author: "Random dude from Sharplow discord server",
    },
    {
      text: "Я Интел юзаюю потому что меня батя пиздил об комп с амд.",
      author: "ArtemZeonov",
    },
    {
      text: "новый проект Redhat Systemd Вирус Эксплоит GCC кибероружие Redhat угроза",
      author: "https://github.com/redhatgccsystemd",
    },
  ];

  function init() {
    var pane = document.getElementById("quote-pane");
    var textEl = document.getElementById("quote-text");
    var authorEl = document.getElementById("quote-author");
    if (!pane || !textEl || !authorEl) return;

    var hint = pane.querySelector(".quote-hint");
    var lastIndex = -1;

    function showRandom() {
      var i = Math.floor(Math.random() * quotes.length);
      if (quotes.length > 1) {
        while (i === lastIndex) {
          i = Math.floor(Math.random() * quotes.length);
        }
      }

      lastIndex = i;
      textEl.textContent = quotes[i].text;
      authorEl.textContent = quotes[i].author;
    }

    pane.addEventListener("click", showRandom);

    if (hint) {
      hint.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showRandom();
        }
      });
    }

    showRandom();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
