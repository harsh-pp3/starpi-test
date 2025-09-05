var ditasearch = {
  div: document.getElementsByClassName("ditasearch")[1],
  init: function () {
    if (typeof ditasearch.div != "undefined") {
      // Functional CSS
      var css = document.createTextNode(
        "\
.ditasearch { overflow: visible; } \
.ditasearch > * { width: 100%; margin: 0; font: inherit; } \
.ditasearch > input {  padding: 0.375rem 0.75rem; } \
.ditasearch > nav { overflow-y: auto; background: #fff; opacity: .99; padding: 0 2px; border-top: 0px none;} \
.ditasearch > nav > ol { margin: 0 0 0 0; list-style-type: none; margin-left: -24px; } .ditasearch > nav > ol > li {padding: .25em !important;} \
.ditasearch > nav > ol > li > a {text-decoration: none;} \
.ditasearch > nav > ol > li > a:focus {outline:0} .ditasearch > nav > ol > li.dsselected{ } \
.ditasearch > nav > ol p { margin: 0 0 0 0; } \
.ditasearch > nav.dspending * { color: #bfbfbf; } \
.ditasearch > nav.dshidden { display: none } \
                        "
      );
      var style = document.createElement("STYLE");
      style.setAttribute("type", "text/css");
      style.appendChild(css);
      document.getElementsByTagName("HEAD")[0].appendChild(style);

      // HTML
      ditasearch.div.innerHTML =
        '<input autocomplete="off" class="ditaSearchInput" type="text" placeholder="' +
        ditasearch.strings.input_placeholder +
        '" aria-label="' +
        ditasearch.strings.input_aria_label +
        '"><nav class="dshidden" aria-live="polite" aria-label="' +
        ditasearch.strings.results_aria_label +
        '"></nav>';
      ditasearch.div.setAttribute("role", "search");
      ditasearch.div.setAttribute(
        "aria-label",
        ditasearch.strings.searchdiv_aria_label
      );

      // Shorthand for child elements
      ditasearch.div.input = ditasearch.div.querySelector("input");
      ditasearch.div.results = ditasearch.div.querySelector("nav");

      var saved = ditasearch.load();
      if (saved != null) {
        ditasearch.div.input.value = saved.query;
        ditasearch.results.toHTML(saved.results);
        ditasearch.results.hide();
      }

      // Event handlers
      ditasearch.div.addEventListener("click", ditasearch.results.show);
      ditasearch.div.addEventListener("blur", ditasearch.cancel);
      ditasearch.div.input.addEventListener("focus", ditasearch.results.show);
      ditasearch.div.input.addEventListener("input", ditasearch.delaySearch);
      ditasearch.div.addEventListener("keydown", function (event) {
        ditasearch.keyboard(event);
      });
      ditasearch.div.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      document
        .getElementsByTagName("BODY")[0]
        .addEventListener("click", ditasearch.cancel);
      ditasearch.div.results.addEventListener(
        "focus",
        function (event) {
          event.target.parentNode.className = "dsselected";
        },
        true
      );
      ditasearch.div.results.addEventListener(
        "blur",
        function (event) {
          event.target.parentNode.className = "";
        },
        true
      );
      ditasearch.div.results.addEventListener("click", function (event) {
        if (event.target.nodeName == "A") {
          event.stopPropagation();
          ditasearch.cancel();
        }
      });
    }
  },
  keyboard: function (event) {
    var key = event.target.nodeName + "-" + event.which;
    var current = event.target;
    var navTarget = null;
    switch (key) {
      case "INPUT-27":
        ditasearch.cancel();
        break;
      case "A-27":
        ditasearch.cancel();
        break;
      case "INPUT-13":
        event.stopPropagation();
        navTarget = current.nextElementSibling;
        break;
      case "INPUT-40":
        event.stopPropagation();
        navTarget = current.nextElementSibling;
        break;
      case "A-40":
        event.stopPropagation();
        navTarget = current.parentNode.nextElementSibling;
        break;
      case "A-38":
        event.stopPropagation();
        navTarget = current.parentNode.previousElementSibling;
        navTarget = navTarget
          ? navTarget
          : current.parentNode.parentNode.parentNode.previousElementSibling;
        break;
    }
    navTarget =
      navTarget && (navTarget.nodeName == "LI" || navTarget.nodeName == "NAV")
        ? navTarget.getElementsByTagName("A")[0]
        : navTarget;
    if (navTarget) {
      navTarget.focus();
    }
    // to style the active li:
    // add/remove li class with onfocus/onblur events for the A child
  },
  timer: null,
  cancel: function () {
    window.clearTimeout(ditasearch.timer);
    ditasearch.div.input.blur();
    ditasearch.results.hide();
  },
  delaySearch: function () {
    window.clearTimeout(ditasearch.timer);
    ditasearch.timer = window.setTimeout(ditasearch.search, 500);
    ditasearch.results.pending();
  },
  query: {
    value: "",
    get: function () {
      ditasearch.query.value = ditasearch.div.input.value;
      return ditasearch.query.prestem(ditasearch.query.value);
    },
    prestem: function (words) {
      words = words.toLowerCase();
      words = words.replace(/([0-9])[,\.]+(?=[0-9])/g, "$1");
      words = words.replace(/([0-9][0-9,\.]*[0-9])/g, " $1 ");
      // digits2words
      var ones = words
        .replace(/([a-z])1/g, "$1one")
        .replace(/1([a-z])/g, "one$1");
      var tos = ones.replace(/([a-z])2/g, "$1to").replace(/2([a-z])/g, "to$1");
      var fors = tos
        .replace(/([a-z])4/g, "$1for")
        .replace(/4([a-z])/g, "for$1");
      words = words.replace(/[^a-z0-9' ]/g, " ");
      return words.trim();
    },
  },
  comparestrings: function (stringa, stringb) {
    // need to normalize spaces or remove ellipses?
    var stringa = stringa || "";
    var stringb = stringb || "";
    var a = stringa.trim();
    var b = stringb.trim();
    if (a == b) {
      return 100;
    } else {
      var l = Math.min(a.length, b.length);
      a = a.substr(0, l);
      b = b.substr(0, l);
      for (var i = 0; a.substr(0, i) == b.substr(0, i); i++) {}
      return Math.round((i * 100) / l);
    }
  },
  search: function () {
    var query = ditasearch.query.get();
    var terms = query.split(" ");
    ditasearchStems = [];
    for (var i = 0; i < terms.length; i++) {
      // stem each search term
      ditasearchStems.push(ditasearch.porter2.stem(terms[i]));
    }
    ditasearchStems = ditasearchStems.concat(
      ditasearch.getSynonyms(ditasearchStems)
    );

    var results = [];
    for (var i = 0; i < ditasearchStems.length; i++) {
      // each search stem (including synonyms)
      var termbonus = i >= terms.length ? 100 : 1000; // reduced bonus for synonyms
      var stem = ditasearchStems[i];
      if (typeof ditasearch.helpindex[stem] != "undefined") {
        for (var j = 0; j < ditasearch.helpindex[stem].length; j++) {
          // each result for the term
          var thishref = Object.keys(ditasearch.helpindex[stem][j])[0];
          var thissummary = ditasearch.topicsummaries[thishref] || {
            searchtitle: "",
            shortdesc: "",
          };
          var thistitle =
            thissummary.searchtitle.length > 0
              ? thissummary.searchtitle.replace(/[<>]/gi, "")
              : "***";
          var thisdesc =
            thissummary.shortdesc.length > 0
              ? thissummary.shortdesc.replace(/[<>]/gi, "")
              : "";

          var thisresult = {
            title: thistitle,
            href: thishref,
            shortdesc: thisdesc,
            terms: stem,
            score:
              parseInt(ditasearch.helpindex[stem][j][thishref]) + termbonus,
          };
          if (ditasearchStems.length > 1) {
            // combine dups
            var matched = results.filter(function (item) {
              return item.href == thishref;
            });
            if (matched.length == 1) {
              // matched.length can be 0 or 1
              var unmatched = results.filter(function (item) {
                return item.href != thishref;
              });
              thisresult.terms += " " + matched[0].terms;
              thisresult.score += matched[0].score;
              results = unmatched;
            }
          }
          results.push(thisresult);
        }
      }
    }
    if (query == "") {
      ditasearch.results.clear();
      sessionStorage.removeItem("ditasearch");
    } else if (results.length == 0) {
      results.push({ title: ditasearch.strings.results_no_results });
      ditasearch.save({ query: ditasearch.query.value, results: results });
      ditasearch.results.toHTML(results);
    } else {
      results.sort(function (a, b) {
        return b.score - a.score;
      });
      ditasearch.save({ query: ditasearch.query.value, results: results });
      ditasearch.results.toHTML(results);
    }
  },
  save: function (object) {
    sessionStorage.setItem("ditasearch", JSON.stringify(object));
  },
  load: function () {
    // return JSON.parse(sessionStorage.getItem("ditasearch"));
  },
  getSynonyms: function (stemlist) {
    var synonyms = [];
    for (var i = 0; i < stemlist.length; i++) {
      for (var j = stemlist.length; j >= i; j--) {
        // find longest matching phrase from end
        var phrase = stemlist.slice(i, j + 1).join("_");
        if (phrase in ditasearch.configs.synonyms) {
          synonyms = synonyms.concat(ditasearch.configs.synonyms[phrase]);
        }
      }
    }
    // remove duplicates
    for (var i = 0; i < synonyms.length; i++) {
      for (var j = 0; j < stemlist.length; j++) {
        if (synonyms[i] == stemlist[j]) {
          synonyms.splice(i, 1);
        }
      }
    }
    for (var i = 0; i < synonyms.length; i++) {
      for (var j = i + 1; j < synonyms.length; j++) {
        if (synonyms[i] == synonyms[j]) {
          synonyms.splice(j, 1);
        }
      }
    }
    return synonyms;
  },
  results: {
    pending: function () {
      ditasearch.div.results.className = "dspending";
    },
    toHTML: function (results) {
      /* results data structure :
                              "title"     : string,
                              "href"      : string,
                              "shortdesc" : string,
                              "terms"     : string,
                              "score"     : number  */

      var baseUrl = window.location.origin;

      var alinkbase =
        '<a href="' +
        baseUrl +
        "/" +
        ditasearch.div.getAttribute("data-searchroot");
      // var alinkbase =
      //   '<a href="' + ditasearch.div.getAttribute("data-searchroot");

      var queryparam = "?query=" + encodeURIComponent(ditasearch.query.value);
      var resultsHTML = "<ol>";
      for (var i = 0; i < results.length; i++) {
        var scoreattr = (stemsattr = "");
        if (typeof results[i].score == "number") {
          scoreattr = ' data-score="' + results[i].score + '"';
        }
        if (typeof results[i].terms == "string") {
          stemsattr = ' data-stems="' + results[i].terms + '"';
        }
        var alink =
          typeof results[i].href == "string" && results[i].href.length > 0
            ? alinkbase +
              results[i].href +
              queryparam +
              '">' +
              results[i].title +
              "</a>"
            : "<p>" + results[i].title + "</p>";

        var shortdesc =
          typeof results[i].shortdesc == "string" &&
          results[i].shortdesc.length > 0
            ? '<p class="shortdesc">' + results[i].shortdesc + "</p>"
            : "";
        resultsHTML +=
          "<li" + scoreattr + stemsattr + ">" + alink + shortdesc + "</li>";
      }

      resultsHTML += "</ol>";
      ditasearch.div.results.innerHTML = resultsHTML;
      ditasearch.div.results.scrollTop = 0;
      ditasearch.results.show();
    },
    show: function () {
      ditasearch.div.results.className = "";
    },
    hide: function () {
      ditasearch.div.results.className = "dshidden";
    },
    clear: function () {
      ditasearch.div.results.innerHTML = "";
    },
  },
  remove: function () {
    ditasearch.div.innerHTML = "";
  },
  porter2: {
    apos: "'",
    nonwordchars: "[^a-z']",
    exceptionlist: [
      {"skis":"ski"},{"skies":"sky"},{"dying":"die"},{"lying":"lie"},{"tying":"tie"},{"idly":"idl"},{"gently":"gentl"},{"ugly":"ugli"},{"early":"earli"},{"only":"onli"},{"singly":"singl"},{"sky":"sky"},{"news":"news"},{"howe":"howe"},{"atlas":"atlas"},{"cosmos":"cosmos"},{"bias":"bias"},{"andes":"andes"},{"cacti":"cactus"},{"addenda":"addendum"},{"appendices":"appendix"},{"bases":"basi"},{"codices":"codex"},{"compendia":"compendium"},{"crematoria":"crematorium"},{"crises":"crisi"},{"cruces":"crux"},{"ellipses":"ellipsi"},{"foci":"focus"},{"formulae":"formula"},{"genera":"genus"},{"helices":"helix"},{"indices":"index"},{"matrices":"matrix"},{"maxima":"maximum"},{"memoranda":"memorandum"},{"minima":"minimum"},{"nuclei":"nucleus"},{"oases":"oasi"},{"pedagogical":"pedagogi"},{"radices":"radix"},{"radii":"radius"},{"referenda":"referendum"},{"stigmata":"stigma"},{"strata":"stratum"},{"theses":"thesi"},{"vortices":"vortex"},{"arose":"aris"},{"arisen":"aris"},{"awaken":"awak"},{"awoke":"awak"},{"awoken":"awak"},{"was":"be"},{"were":"be"},{"been":"be"},{"bore":"bear"},{"born":"bear"},{"beaten":"beat"},{"became":"becom"},{"began":"begin"},{"begun":"begin"},{"bent":"bend"},{"bound":"bind"},{"bit":"bite"},{"bitten":"bite"},{"bled":"bleed"},{"blew":"blow"},{"blown":"blow"},{"broke":"break"},{"broken":"break"},{"bred":"breed"},{"brought":"bring"},{"built":"build"},{"burnt":"burn"},{"bought":"buy"},{"caught":"catch"},{"chose":"choos"},{"chosen":"choos"},{"clung":"cling"},{"came":"come"},{"crept":"creep"},{"dealt":"deal"},{"dug":"dig"},{"dove":"dive"},{"did":"do"},{"done":"do"},{"drew":"draw"},{"drawn":"draw"},{"drank":"drink"},{"drunk":"drink"},{"drove":"drive"},{"driven":"drive"},{"ate":"eat"},{"eaten":"eat"},{"fell":"fall"},{"fallen":"fall"},{"fed":"feed"},{"felt":"feel"},{"fought":"fight"},{"found":"find"},{"fled":"flee"},{"flung":"fling"},{"flew":"fli"},{"flown":"fli"},{"forbad":"forbid"},{"forbidden":"forbid"},{"foresaw":"forese"},{"foreseen":"forese"},{"forgot":"forget"},{"forgotten":"forget"},{"forgave":"forgiv"},{"forgiven":"forgiv"},{"forsook":"forsak"},{"forsaken":"forsak"},{"froze":"freez"},{"frozen":"freez"},{"frostbitten":"frostbit"},{"got":"get"},{"gotten":"get"},{"gave":"give"},{"given":"give"},{"went":"go"},{"gone":"go"},{"ground":"grind"},{"grew":"grow"},{"grown":"grow"},{"handwritten":"handwrit"},{"hung":"hang"},{"had":"have"},{"heard":"hear"},{"hid":"hide"},{"hidden":"hide"},{"held":"hold"},{"inlaid":"inlay"},{"interwove":"interweav"},{"interwoven":"interweav"},{"kept":"keep"},{"knelt":"kneel"},{"knew":"know"},{"known":"know"},{"laid":"lay"},{"led":"lead"},{"leapt":"leap"},{"left":"leav"},{"lent":"lend"},{"lay":"lie"},{"lain":"lie"},{"lit":"light"},{"lost":"lose"},{"made":"make"},{"meant":"mean"},{"met":"meet"},{"misheard":"mishear"},{"mislaid":"mislay"},{"misled":"mislead"},{"misspoke":"misspeak"},{"misspoken":"misspeak"},{"misspent":"misspend"},{"mistook":"mistak"},{"mistaken":"mistak"},{"mistaught":"misteach"},{"misunderstood":"misunderstand"},{"miswrote":"miswrit"},{"miswritten":"miswrit"},{"mown":"mow"},{"outdid":"outdo"},{"outdone":"outdo"},{"outdrew":"outdraw"},{"outdrawn":"outdraw"},{"outdrank":"outdrink"},{"outdrunk":"outdrink"},{"outdrove":"outdriv"},{"outdriven":"outdriv"},{"outfought":"outfight"},{"outflew":"outfli"},{"outflown":"outfli"},{"outgrew":"outgrow"},{"outgrown":"outgrow"},{"outrode":"outrid"},{"outridden":"outrid"},{"outran":"outrun"},{"outsold":"outsel"},{"outshone":"outshin"},{"outshot":"outshoot"},{"outsang":"outs"},{"outsung":"outs"},{"outsat":"outsit"},{"outslept":"outsleep"},{"outspoke":"outspeak"},{"outspoken":"outspeak"},{"outsped":"outspe"},{"outspent":"outspend"},{"outswore":"outswear"},{"outsworn":"outswear"},{"outswam":"outswim"},{"outswum":"outswim"},{"outthought":"outthink"},{"outthrew":"outthrow"},{"outthrown":"outthrow"},{"outwrote":"outwrit"},{"outwritten":"outwrit"},{"overbreed":"overbre"},{"overbuilt":"overbuild"},{"overbought":"overbuy"},{"overcame":"overcom"},{"overdid":"overdo"},{"overdone":"overdo"},{"overdrew":"overdraw"},{"overdrawn":"overdraw"},{"overdrank":"overdrink"},{"overdrunk":"overdrink"},{"overate":"overeat"},{"overeaten":"overeat"},{"overfeed":"overfe"},{"overhung":"overhang"},{"overheard":"overhear"},{"overlaid":"overlay"},{"overpaid":"overpay"},{"overrode":"overrid"},{"overridden":"overrid"},{"overran":"overrun"},{"oversaw":"overse"},{"overseen":"overse"},{"oversold":"oversel"},{"oversewn":"oversew"},{"overshot":"overshoot"},{"overslept":"oversleep"},{"overspoke":"overspeak"},{"overspoken":"overspeak"},{"overtook":"overtak"},{"overtaken":"overtak"},{"overthought":"overthink"},{"overthrew":"overthrow"},{"overthrown":"overthrow"},{"overwound":"overwind"},{"overwrote":"overwrit"},{"overwritten":"overwrit"},{"partook":"partak"},{"partaken":"partak"},{"paid":"pay"},{"pled":"plead"},{"prebuilt":"prebuild"},{"predid":"predo"},{"predone":"predo"},{"premade":"premak"},{"prepaid":"prepay"},{"presold":"presel"},{"preshrank":"preshrink"},{"preshrunk":"preshrink"},{"proven":"prove"},{"reawoke":"reawak"},{"reawaken":"reawak"},{"rebound":"rebind"},{"rebuilt":"rebuild"},{"redealt":"redeal"},{"redid":"redo"},{"redone":"redo"},{"redrew":"redraw"},{"redrawn":"redraw"},{"reground":"regrind"},{"regrew":"regrow"},{"regrown":"regrow"},{"rehung":"rehang"},{"reheard":"rehear"},{"relaid":"relay"},{"relit":"relight"},{"remad":"remak"},{"repaid":"repay"},{"reran":"rerun"},{"resold":"resel"},{"resent":"resend"},{"resewn":"resew"},{"retook":"retak"},{"retaken":"retak"},{"retaught":"reteach"},{"retore":"retear"},{"retorn":"retear"},{"retold":"retel"},{"rethought":"rethink"},{"rewoke":"rewak"},{"rewaken":"rewak"},{"rewore":"rewear"},{"reworn":"rewear"},{"rewove":"reweav"},{"rewoven":"reweav"},{"rewon":"rewin"},{"rewound":"rewind"},{"rewrote":"rewrit"},{"rewritten":"rewrit"},{"rode":"ride"},{"ridden":"ride"},{"rang":"ring"},{"rung":"ring"},{"rose":"rise"},{"risen":"rise"},{"ran":"run"},{"sawn":"saw"},{"said":"say"},{"saw":"see"},{"seen":"see"},{"sought":"seek"},{"sold":"sell"},{"sent":"send"},{"sewn":"sew"},{"shook":"shake"},{"shaken":"shake"},{"shaven":"shave"},{"shorn":"shear"},{"shone":"shine"},{"shot":"shoot"},{"shown":"show"},{"shrank":"shrink"},{"shrunk":"shrink"},{"sang":"sing"},{"sung":"sing"},{"sank":"sink"},{"sunk":"sink"},{"sat":"sit"},{"slept":"sleep"},{"slid":"slide"},{"slung":"sling"},{"sown":"sow"},{"spoke":"speak"},{"spoken":"speak"},{"sped":"speed"},{"spent":"spend"},{"spun":"spin"},{"spat":"spit"},{"sprang":"spring"},{"sprung":"spring"},{"stood":"stand"},{"stole":"steal"},{"stolen":"steal"},{"stuck":"stick"},{"stung":"sting"},{"stank":"stink"},{"stunk":"stink"},{"strewn":"strew"},{"strode":"stride"},{"stridden":"stride"},{"struck":"strike"},{"stricken":"strike"},{"strung":"string"},{"strove":"strive"},{"striven":"strive"},{"swore":"swear"},{"sworn":"swear"},{"swept":"sweep"},{"swollen":"swell"},{"swam":"swim"},{"swum":"swim"},{"swung":"swing"},{"took":"take"},{"taken":"take"},{"taught":"teach"},{"tore":"tear"},{"torn":"tear"},{"told":"tell"},{"thought":"think"},{"threw":"throw"},{"thrown":"throw"},{"typewrote":"typewrit"},{"typewritten":"typewrit"},{"unbound":"unbind"},{"underfeed":"underfe"},{"underwent":"undergo"},{"undergone":"undergo"},{"underlay":"underli"},{"underlain":"underli"},{"undersold":"undersel"},{"underspent":"underspend"},{"understood":"understand"},{"undertook":"undertak"},{"undertaken":"undertak"},{"underwrote":"underwrit"},{"underwritten":"underwrit"},{"undid":"undo"},{"undone":"undo"},{"unfroze":"unfreez"},{"unfrozen":"unfreez"},{"unhung":"unhang"},{"unhidden":"unhid"},{"unsewn":"unsew"},{"unslung":"unsl"},{"unspun":"unspin"},{"unstuck":"unstick"},{"unstrung":"unstr"},{"unwove":"unweav"},{"unwoven":"unweav"},{"unwound":"unwind"},{"upheld":"uphold"},{"woke":"wake"},{"woken":"wake"},{"waylaid":"waylay"},{"wore":"wear"},{"worn":"wear"},{"wove":"weav"},{"woven":"weav"},{"wept":"weep"},{"won":"win"},{"wound":"wind"},{"withdrew":"withdraw"},{"withdrawn":"withdraw"},{"withheld":"withhold"},{"withstood":"withstand"},{"wrung":"wring"},{"wrote":"write"},{"written":"write"},{"unbent":"unbend"},{"calves":"calf"},{"elves":"elf"},{"halves":"half"},{"hooves":"hoof"},{"knives":"knife"},{"leaves":"leaf"},{"lives":"life"},{"loaves":"loaf"},{"shelves":"shelf"},{"thieves":"thief"},{"wives":"wife"},{"wolves":"wolf"},{"scarves":"scarf"},{"wharves":"wharf"},{"dwarves":"dwarf"},{"analyses":"analysi"},{"axis":"axe"},{"hypotheses":"hypothesi"},{"parentheses":"parenthesi"},{"synopses":"synopsi"},{"curricula":"curriculum"},{"millenia":"millenium"},{"criteria":"criterion"},{"phenomena":"phenomenon"},{"alumni":"alumnus"},{"antennae":"antenna"},{"html5":"html"}
    ],
    post_s1a_exceptions: [
      { inning: "inning" },
      { outing: "outing" },
      { canning: "canning" },
      { herring: "herring" },
      { earring: "earring" },
      { proceed: "proceed" },
      { exceed: "exceed" },
      { succeed: "succeed" },
    ],
    s0_sfxs: /('|'s|'s')$/,
    s1a_replacements: [
      { suffix: "sses", with: "ss" },
      { suffix: "ied", with: "i|ie", complexrule: "s1a" },
      { suffix: "ies", with: "i|ie", complexrule: "s1a" },
      { suffix: "us", with: "us" },
      { suffix: "ss", with: "ss" },
      { suffix: "s", with: "", ifprecededby: "[aeiouy].+" },
    ],
    s1b_replacements: [
      { suffix: "eedly", with: "ee", ifin: "R1" },
      {
        suffix: "ingly",
        with: "",
        ifprecededby: "[aeiouy].*",
        complexrule: "s1b",
      },
      {
        suffix: "edly",
        with: "",
        ifprecededby: "[aeiouy].*",
        complexrule: "s1b",
      },
      { suffix: "eed", with: "ee", ifin: "R1" },
      {
        suffix: "ing",
        with: "",
        ifprecededby: "[aeiouy].*",
        complexrule: "s1b",
      },
      {
        suffix: "ed",
        with: "",
        ifprecededby: "[aeiouy].*",
        complexrule: "s1b",
      },
    ],
    s2_replacements: [
      { suffix: "ization", with: "ize", ifin: "R1" },
      { suffix: "ational", with: "ate", ifin: "R1" },
      { suffix: "fulness", with: "ful", ifin: "R1" },
      { suffix: "ousness", with: "ous", ifin: "R1" },
      { suffix: "iveness", with: "ive", ifin: "R1" },
      { suffix: "tional", with: "tion", ifin: "R1" },
      { suffix: "biliti", with: "ble", ifin: "R1" },
      { suffix: "lessli", with: "less", ifin: "R1" },
      { suffix: "entli", with: "ent", ifin: "R1" },
      { suffix: "ation", with: "ate", ifin: "R1" },
      { suffix: "alism", with: "al", ifin: "R1" },
      { suffix: "aliti", with: "al", ifin: "R1" },
      { suffix: "ousli", with: "ous", ifin: "R1" },
      { suffix: "iviti", with: "ive", ifin: "R1" },
      { suffix: "fulli", with: "ful", ifin: "R1" },
      { suffix: "enci", with: "ence", ifin: "R1" },
      { suffix: "anci", with: "ance", ifin: "R1" },
      { suffix: "abli", with: "able", ifin: "R1" },
      { suffix: "izer", with: "ize", ifin: "R1" },
      { suffix: "ator", with: "ate", ifin: "R1" },
      { suffix: "alli", with: "al", ifin: "R1" },
      { suffix: "bli", with: "ble", ifin: "R1" },
      { suffix: "ogi", with: "og", ifin: "R1", ifprecededby: "l" },
      { suffix: "li", with: "", ifin: "R1", ifprecededby: "[cdeghkmnrt]" },
    ],
    s3_replacements: [
      { suffix: "ational", with: "ate", ifin: "R1" },
      { suffix: "tional", with: "tion", ifin: "R1" },
      { suffix: "alize", with: "al", ifin: "R1" },
      { suffix: "ative", with: "", ifin: "R1,R2" },
      { suffix: "icate", with: "ic", ifin: "R1" },
      { suffix: "iciti", with: "ic", ifin: "R1" },
      { suffix: "ical", with: "ic", ifin: "R1" },
      { suffix: "ness", with: "", ifin: "R1" },
      { suffix: "ful", with: "", ifin: "R1" },
    ],
    s4_replacements: [
      { suffix: "ement", with: "", ifin: "R2" },
      { suffix: "ance", with: "", ifin: "R2" },
      { suffix: "ence", with: "", ifin: "R2" },
      { suffix: "able", with: "", ifin: "R2" },
      { suffix: "ible", with: "", ifin: "R2" },
      { suffix: "ment", with: "", ifin: "R2" },
      { suffix: "ant", with: "", ifin: "R2" },
      { suffix: "ate", with: "", ifin: "R2" },
      { suffix: "ent", with: "", ifin: "R2" },
      { suffix: "ion", with: "", ifin: "R2", ifprecededby: "[st]" },
      { suffix: "ism", with: "", ifin: "R2" },
      { suffix: "iti", with: "", ifin: "R2" },
      { suffix: "ive", with: "", ifin: "R2" },
      { suffix: "ize", with: "", ifin: "R2" },
      { suffix: "ous", with: "", ifin: "R2" },
      { suffix: "ic", with: "", ifin: "R2" },
      { suffix: "er", with: "", ifin: "R2" },
      { suffix: "al", with: "", ifin: "R2" },
    ],
    s5_replacements: [
      { suffix: "e", with: "", complexrule: "s5" },
      { suffix: "l", with: "", ifin: "R2", ifprecededby: "l" },
    ],
    R1: function (thisword) {
      var exceptions = /^(gener|commun|arsen)/;
      var r1base = /^.*?[aeiouy][^aeiouy]/;
      if (exceptions.test(thisword)) {
        return thisword.replace(exceptions, "");
      } else if (r1base.test(thisword)) {
        return thisword.replace(r1base, "");
      } else {
        return "";
      }
    },
    R2: function (thisword) {
      thisword = ditasearch.porter2.R1(thisword);
      var r1base = /^.*?[aeiouy][^aeiouy]/;
      if (r1base.test(thisword)) {
        return thisword.replace(r1base, "");
      } else {
        return "";
      }
    },
    endsWithShortSyllable: function (thisword) {
      var eSS = /([^aeiouy][aeiouy][^aeiouywxY]$|^[aeiouy][^aeiouy]$)/;
      return eSS.test(thisword);
    },
    isShort: function (thisword) {
      return (
        ditasearch.porter2.R1(thisword).length == 0 &&
        ditasearch.porter2.endsWithShortSyllable(thisword)
      );
    },
    keyMatches: function (object) {
      // object is the array object passed from ditasearch.porter2.firstMatch
      var thisword = this[0];
      var wholeword = this[1];
      var suffix = object.suffix || Object.keys(object)[0];
      var regex = new RegExp(wholeword ? "^" + suffix + "$" : suffix + "$");
      if (regex.test(thisword)) {
      }
      return regex.test(thisword);
    },
    firstMatch: function (array, thisword, wholeword) {
      var wholeword = wholeword || false;
      var data = [thisword, wholeword];
      return array.filter(ditasearch.porter2.keyMatches, data)[0] || [];
    },
    stem: function (thisword) {
      // note: ditasearch.porter2.stemOrException subsumed into ditasearch.porter2.stem

      thisword = thisword
        .toLowerCase()
        .replace(ditasearch.porter2.nonwordchars, "");
      var exception = ditasearch.porter2.firstMatch(
        ditasearch.porter2.exceptionlist,
        thisword,
        true
      );
      //  exception = array containing first matching object or nothing
      if (thisword.length <= 2) {
        return thisword;
      } else if (exception.length != 0) {
        return exception[thisword];
      } else {
        return ditasearch.porter2.getStem(thisword);
      }
    },
    replace_suffix: function (thisword, array) {
      var replacearray = ditasearch.porter2.firstMatch(array, thisword);
      if (typeof replacearray == "undefined" || replacearray.length == 0) {
        // no matches
        return thisword;
      }
      var replace = replacearray;

      var restrictions = "";
      if (replace.hasOwnProperty("ifin")) {
        restrictions += replace.ifin.indexOf("R1") > -1 ? "R1" : "";
        restrictions += replace.ifin.indexOf("R2") > -1 ? "R2" : "";
      }
      if (replace.hasOwnProperty("ifprecededby")) {
        restrictions += replace.ifprecededby.length > 0 ? "PrecededBy" : "";
      }
      if (replace.hasOwnProperty("complexrule")) {
        restrictions +=
          replace.complexrule.length > 0
            ? "ComplexRule_" + replace.complexrule
            : "";
      }
      var suffix = new RegExp(replace.suffix + "$");
      var precededsuffix = new RegExp(replace.ifprecededby + suffix.source);

      switch (restrictions) {
        // no restrictions
        case "":
          thisword = thisword.replace(suffix, replace.with);
          break;

        // restrictions
        case "R1":
          if (ditasearch.porter2.R1(thisword).search(suffix) > -1) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        case "R2":
          if (ditasearch.porter2.R2(thisword).search(suffix) > -1) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        case "R1R2":
          if (
            ditasearch.porter2.R1(thisword).search(suffix) > -1 &&
            ditasearch.porter2.R2(thisword).search(suffix) > -1
          ) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        case "PrecededBy":
          if (thisword.search(precededsuffix) > -1) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        case "R1PrecededBy":
          if (
            ditasearch.porter2.R1(thisword).search(suffix) > -1 &&
            thisword.search(precededsuffix) > -1
          ) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        case "R2PrecededBy":
          if (
            ditasearch.porter2.R2(thisword).search(suffix) > -1 &&
            thisword.search(precededsuffix) > -1
          ) {
            thisword = thisword.replace(suffix, replace.with);
          }
          break;
        // complex rules
        case "ComplexRule_s1a":
          precededsuffix = new RegExp(".." + suffix.source);
          if (thisword.search(precededsuffix) > -1) {
            thisword = thisword.replace(suffix, "i");
          } else {
            thisword = thisword.replace(suffix, "ie");
          }
          break;
        case "PrecededByComplexRule_s1b":
          if (thisword.search(precededsuffix) > -1) {
            thisword = thisword.replace(suffix, "");
            if (thisword.search(/(at|bl|iz)$/) > -1) {
              thisword = thisword + "e";
            } else if (thisword.search(/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/) > -1) {
              thisword = thisword.replace(/.$/, "");
            } else if (ditasearch.porter2.isShort(thisword)) {
              thisword = thisword + "e";
            }
          }
          break;
        case "ComplexRule_s5":
          if (
            ditasearch.porter2.R2(thisword).search(suffix) > -1 ||
            (ditasearch.porter2.R1(thisword).search(suffix) > -1 &&
              !ditasearch.porter2.endsWithShortSyllable(
                thisword.replace(suffix, "")
              ))
          ) {
            thisword = thisword.replace(suffix, "");
          }
          break;
      }
      return thisword;
    },
    getStem: function (word) {
      var noinitpostrophes = word.replace(/^'/, "");
      var consonantY = noinitpostrophes.replace(/(^|[aeiouy])y/, "$1Y");
      var s0 = consonantY.replace(ditasearch.porter2.s0_sfxs, "");
      var s1a = ditasearch.porter2.replace_suffix(
        s0,
        ditasearch.porter2.s1a_replacements
      );
      var s1b = ditasearch.porter2.replace_suffix(
        s1a,
        ditasearch.porter2.s1b_replacements
      );
      var s1c = s1b.replace(/(.[^aeiouy])[yY]$/, "$1i");
      var s2 = ditasearch.porter2.replace_suffix(
        s1c,
        ditasearch.porter2.s2_replacements
      );
      var s3 = ditasearch.porter2.replace_suffix(
        s2,
        ditasearch.porter2.s3_replacements
      );
      var s4 = ditasearch.porter2.replace_suffix(
        s3,
        ditasearch.porter2.s4_replacements
      );
      var s5 = ditasearch.porter2.replace_suffix(
        s4,
        ditasearch.porter2.s5_replacements
      );
      var post_s1a_exception = ditasearch.porter2.firstMatch(
        ditasearch.porter2.post_s1a_exceptions,
        s1a,
        true
      );
      if (post_s1a_exception.length != 0) {
        return post_s1a_exception[s1a];
      } else {
        return s5.toLowerCase();
      }
    },
  },
  strings: {
    searchdiv_aria_label:"search",input_aria_label:"search terms",input_placeholder:"Search",results_aria_label:"search results",results_no_results:"No topics found"
  },
  configs: {
    stopwords: "stopwords are not indexed",
    synonyms: {
      "abandon":["forsak","desert"],"abbey":["monasteri"],"abl":["capabl"],"abort":["termin"],"abridg":["shorten","cut"],"absolut":["perfect","complet"],"absorpt":["preoccup","engross","assimil"],"abund":["plenti"],"abus":["insult","maltreat"],"academi":["school"],"accept":["adopt","espous"],"access":["entre","access","admitt"],"accid":["mishap","fortuiti"],"account":["explan","comptrol","control"],"accumul":["accret"],"achiev":["accomplish","attain"],"acquaint":["familiar"],"acquisit":["possess"],"acquit":["clear"],"act":["action","activ"],"activ":["vigor","activ","action"],"add":["total"],"addict":["hook"],"addit":["improv","summat","plus"],"adjust":["conform","adapt"],"administr":["presid"],"admir":["esteem"],"admiss":["acknowledg"],"admit":["acknowledg"],"adopt":["borrow"],"adult":["grownup"],"advanc":["progress","march"],"advantag":["benefit"],"adventur":["escapad"],"advertis":["push","promot","ad","advertis"],"advis":["advisor","consult"],"advoc":["propon"],"affair":["affair","intimaci","liaison","involv"],"affect":["impact"],"affin":["kinship","attract"],"age":["period","epoch","era"],"agil":["nimbl","spri","quick"],"agoni":["torment"],"agre":["consent","assent"],"agreement":["accord"],"agricultur":["farm","husbandri"],"air":["gase"],"alarm":["dismay","constern","fear","warn"],"alcohol":["intoxic","inebri"],"aliv":["live"],"alloc":["allot","share"],"allow":["permit","let"],"alli":["friend"],"aloof":["distant"],"aluminium":["aluminum","al"],"amber":["yellowish"],"ambigu":["equivoc"],"ambit":["ambiti"],"ampl":["sizabl","capaci"],"amput":["remov"],"analysi":["psychoanalysi"],"analyst":["psychoanalyst"],"ancestor":["ancestor"],"anger":["ire"],"angl":["slant","bias"],"anim":["beast","brute","creatur","fauna"],"announc":["proclam","declar"],"annual":["year"],"answer":["repli","respond"],"anticip":["expect"],"anxieti":["anxious"],"apparatus":["setup","equip"],"appeal":["appealing","charm","solicit"],"appetit":["crave"],"applaud":["clap"],"appl":["fruit"],"appoint":["name","nomin","job","post"],"approach":["near"],"approv":["bless","ok","okay","sanction"],"arch":["archway"],"archiv":["archiv"],"area":["expans"],"argument":["argument","debat"],"aris":["origin","develop"],"arrang":["order","placement"],"arrest":["apprehend"],"arrow":["pointer","indic","projectil"],"articul":["eloqu","enunci"],"artifici":["unreal","unnatur"],"ask":["inquir"],"aspect":["facet"],"assault":["attack"],"assembl":["fabric","construct","assemblag"],"assess":["apprais","judgment","judgement"],"asset":["plus"],"assign":["task"],"associ":["affili"],"assum":["presum"],"assumpt":["premis","premiss"],"astonish":["astound","stagger"],"asylum":["refug","sanctuari","shelter"],"athlet":["jock"],"atmospher":["ambianc","ambienc"],"attach":["affect","fond"],"attack":["assail","assault","onslaught"],"attic":["loft","garret"],"attract":["appeal","attract","pleas"],"auction":["sale"],"audienc":["spectat","listen"],"auditor":["student"],"aunt":["aunti","relat"],"authoris":["empow"],"avail":["obtain"],"avenu":["boulevard"],"averag":["norm"],"award":["prize"],"awar":["mind"],"aw":["dread","terribl"],"babi":["babe","infant"],"back":["rear","spine","backbon"],"background":["grind"],"bacon":["pork"],"bad":["immor","evil","defect","spoil","spoilt"],"bait":["lure","sweeten","hook"],"balanc":["proport","equilibr","equilibrium"],"ball":["globe","orb"],"ballet":["danc"],"ban":["prohibit","proscript"],"band":["band","stripe","instrumentalist","ring","jewelri"],"bang":["clap","erupt","blast","bam"],"banish":["bar","releg","expel"],"banner":["streamer"],"banquet":["feast"],"bar":["barroom","saloon","tavern","pub"],"bargain":["negoti","dicker"],"barrel":["cask"],"base":["pedest","stand"],"basin":["washbasin","washbowl","washstand","lavatori"],"basi":["base","foundat","fundament"],"basket":["handbasket"],"basketbal":["hoop"],"bathroom":["bath","toilet","lavatori"],"bathtub":["bath","tub"],"batteri":["assault"],"battl":["conflict","fight","engag"],"battlefield":["battleground","field"],"beach":["shore"],"beam":["ray"],"beat":["puls","pulsat","heartbeat","pound","thump","vanquish"],"bee":["insect"],"beef":["meat"],"beg":["implor","entreat"],"begin":["start","commenc"],"behav":["comport"],"behavior":["conduct"],"behead":["decapit"],"bell":["doorbel","buzzer"],"belli":["abdomen","stomach"],"bench":["workbench"],"bend":["crouch","stoop","bow","flex","turn","deform","twist"],"beneficiari":["recipi"],"benefit":["welfar"],"bet":["wager","stake"],"betray":["deceiv"],"bibl":["book","scriptur"],"bike":["bicycl","bike","cycl","wheel"],"bill":["beak","circular","handbil","broadsid","broadsheet","flier"],"bin":["contain"],"biscuit":["cooki"],"bishop":["clergyman"],"bite":["sting"],"bitter":["acrimoni","resent"],"black":["achromat","black"],"blackmail":["extort"],"bland":["tasteless","insipid","flavorless"],"blank":["empti"],"blast":["blare","explos"],"blind":["unsight"],"block":["cube","obstruct","hinder","stymi"],"bloodsh":["gore"],"blow":["revers","setback"],"blue":["blueness","color"],"board":["gameboard","plank"],"bodi":["torso","trunk"],"bolt":["thunderbolt"],"bomb":["bombard"],"bond":["allianc","bail","shackl","hamper"],"book":["volum"],"boot":["footwear"],"border":["borderlin","delimit"],"bother":["annoy","irrit"],"bottl":["vessel"],"bottom":["undersid","undersurfac"],"bow":["genuflect"],"bowel":["intestin","gut"],"bowl":["vessel"],"box":["contain"],"bracket":["categori"],"brag":["boast"],"braid":["plait","tress","hairdo"],"brain":["genius","mastermind","encephalon"],"branch":["limb","fork"],"brand":["make"],"brave":["courag","fearless"],"bread":["breadstuff"],"break":["destroy","fractur","paus","intermiss","interrupt","suspens"],"breast":["bosom","tit"],"breath":["respir"],"breed":["rais"],"breez":["zephyr","air","gust"],"bridg":["span"],"brillianc":["brillianc"],"bring":["fetch"],"brink":["threshold","verg"],"broadcast":["air","send"],"broccoli":["veget"],"brother":["brother","monk","comrad"],"bucket":["pail"],"budg":["shift","stir"],"build":["rais","construct","edific"],"bullet":["slug","projectil"],"bundl":["sheaf"],"burial":["entomb","inhum","inter"],"burn":["injuri","bite","sting","combust"],"burst":["bust"],"bus":["autobus","coach"],"bush":["shrub"],"busi":["occup","job","line"],"buttock":["butt","bum","tush"],"buy":["purchas","acquir"],"cage":["coop"],"calcul":["comput","figur","reckon","deliber","plan"],"call":["birdcal","birdsong","song","name","cri","outcri","yell","shout","vocifer","holler","telephon","phone","ring"],"calm":["quiet","tranquil","quieten"],"calori":["kilocalori"],"candid":["campaign","nomine"],"candl":["taper"],"canva":["canvass","fabric"],"cap":["headdress"],"captain":["skipper"],"captiv":["beguil","charm","bewitch","entranc","enchant"],"captur":["catch","seiz","conquer"],"car":["auto","automobil","motorcar"],"carbon":["c"],"card":["postcard","menu","cart"],"care":["attent","aid","tend","mainten","upkeep","caution","precaut","forethought","judici"],"career":["call","vocat"],"carpet":["rug","carpet"],"carriag":["perambul","pram","stroller"],"carri":["bear","transport"],"cart":["handcart","pushcart"],"case":["instanc","exampl","showcas","vitrin","lawsuit","suit","caus","causa"],"cast":["actor"],"cat":["felin"],"catalogu":["catalog"],"catch":["grab"],"cathedr":["church"],"cattl":["cow","bull"],"ceil":["cap"],"celebr":["festiv"],"cell":["cubicl"],"cellar":["basement"],"cemeteri":["graveyard"],"center":["middl","heart","midpoint"],"certain":["sure"],"chair":["professorship","seat"],"challeng":["disput"],"champion":["champ"],"chanc":["luck","fortun","hazard","opportun","probabl"],"chang":["alter","modif"],"channel":["canal"],"chao":["pandemonium","bedlam"],"charact":["graphem"],"charg":["accus","bill"],"chariti":["gift"],"charter":["document"],"cheap":["inexpens"],"cheat":["fool","swindl"],"check":["confirm","verif","tick","mark","verifi","tab"],"cheek":["impud","impertin","bold","nerv","brass","face"],"chees":["food"],"chequ":["check"],"cherri":["fruit"],"chest":["bureau","dresser","thorax","pectus"],"chew":["mastic"],"chicken":["wimp","crybabi"],"chief":["foreman","boss"],"child":["kid"],"childish":["infantil"],"chimney":["flue"],"chimpanze":["primat"],"chip":["microchip","bite","flake","fleck","scrap","crisp"],"choic":["option","altern"],"choke":["gag","suffoc","strangl"],"chorus":["choir"],"cigarett":["butt","fag"],"cinema":["theater"],"circul":["distribut","dissemin","propag","broadcast","diffus","dispers","spread"],"circumst":["context"],"citi":["metropoli"],"claim":["assert","affirm","demand"],"clarifi":["elucid"],"clash":["friction","conflict"],"class":["cours","form","grade"],"classroom":["schoolroom"],"clear":["empti"],"clearanc":["headroom"],"climat":["clime","weather"],"climb":["mount"],"cliqu":["coteri","ingroup","pack","camp"],"clock":["timepiec"],"close":["near","shut","finish","termin","conclud","end","unopen"],"cloth":["apparel","dress"],"club":["cabaret","nightclub","nightspot","bat","societi","guild","gild","lodg","order"],"clue":["cue","evid","hint"],"cluster":["bunch","clump"],"coach":["tutor"],"coalit":["coalesc","conglutin"],"coast":["seashor","seacoast"],"coat":["garment","coat"],"coerc":["pressur","forc","compel"],"coffe":["beverag"],"coffin":["casket"],"coin":["money"],"coincid":["concur","happenst"],"cold":["cold"],"collaps":["crumbl","crumpl","tumbl"],"collar":["har"],"collect":["aggreg","accumul","assemblag"],"color":["hue"],"column":["pillar","support"],"combin":["blend","mix","conflat","commingl","fuse","merg"],"comfort":["comfort","consol","solac","sooth","eas","comfi"],"command":["compel","control","masteri"],"commemor":["rememb"],"comment":["remark"],"commerc":["commerci","mercantil"],"commiss":["deput","deleg","fee"],"commit":["allegi","loyalti","dedic"],"committe":["commiss"],"common":["mutual","averag","ordinari","usual"],"communist":["marxist"],"compani":["companionship","fellowship","societi","troup"],"compens":["recompens","payment"],"compet":["vie","contend","compet"],"competit":["content","rivalri","contest"],"complex":["complic"],"complianc":["conform","abid"],"compromis":["allow"],"concentr":["focus","engross","absorpt","immers"],"concept":["concept","construct","fertil"],"concern":["interest","fear"],"conclus":["end","finish"],"concret":["materi"],"condit":["circumst","precondit","stipul","status","state"],"confer":["meet"],"confin":["detain"],"confront":["face","clash"],"confus":["throw","befuddl","confound"],"conglomer":["empir"],"connect":["link","connected"],"conscienc":["scrupl"],"conscious":["awar"],"consensus":["agreement"],"conserv":["preserv"],"consid":["debat"],"consider":["thought"],"conspiraci":["cabal","plot"],"constant":["steadfast","unwav","unend","incess"],"constitut":["composit","makeup"],"constraint":["restraint"],"construct":["manufactur","fabric"],"consumpt":["ingest"],"contact":["middleman","touch"],"contain":["incorpor","compris"],"contemporari":["coeval"],"contempt":["disdain","scorn","despit"],"content":["capac","content"],"continu":["lengthi","prolong","extens","uninterrupt"],"contract":["agreement"],"contrast":["opposit","dissimilar"],"contribut":["donat"],"control":["domin","oper","handl","restraint"],"conveni":["applianc","contrapt","gadget","gizmo"],"convent":["custom"],"convers":["talk"],"convinc":["convert"],"convuls":["fit","paroxysm"],"cook":["fix","readi","prepar"],"cool":["unenthusiast","unfriend","unrespons"],"cooper":["collabor"],"cope":["manag"],"copper":["cu","metal"],"copi":["imit","simul","replic"],"cord":["corduroy","fabric"],"corner":["recess","nich"],"corps":["cadav","remain"],"correct":["rectif"],"corrupt":["briberi"],"cottag":["bungalow"],"cotton":["fabric"],"count":["number","enumer"],"countri":["state","nation","land"],"coup":["putsch","takeov"],"coupl":["twosom","duo","duet"],"courag":["braveri","brave"],"cours":["path","track","class"],"court":["courtyard","tribun","judicatur"],"courtship":["woo","court","suit"],"cover":["blanket","screen","conceal"],"coverag":["report","reportag"],"cow":["bovin"],"cower":["fawn","cring","grovel"],"crack":["cleft","crevic","fissur"],"crackpot":["crank","nut","nutcas","fruitcak"],"craft":["craftsmanship","workmanship"],"craftsman":["artisan"],"crash":["collaps","wreck"],"cream":["ointment","emolli","balm"],"credibl":["credibl","believ"],"credit":["recognit"],"creed":["credo","belief"],"creep":["crawl"],"crevic":["cranni","crack","fissur"],"crib":["cheat"],"cricket":["insect"],"crimin":["felon","crook","outlaw","malefactor"],"critic":["critiqu"],"crop":["harvest"],"cross":["hybrid","travers","intersect","crossroad"],"crosswalk":["cross","crossov"],"crouch":["squat"],"crown":["diadem"],"crude":["primit","unrefin","unprocess"],"cruel":["brutal","barbar"],"cruelti":["merciless","pitiless","ruthless"],"crusad":["campaign","caus"],"cri":["weep"],"crystal":["quartz"],"cucumb":["cuke"],"cultiv":["domest","natur","naturalis","tame"],"cultur":["civil","civilis","polish","refin"],"cun":["crafti","guil","slyness","wili"],"cup":["cup"],"cupboard":["closet"],"curl":["coil","loop"],"currenc":["money"],"curtain":["drape"],"custodi":["detent","detain","hold"],"custom":["client","patron"],"cut":["cleav","gash","slash","wind","clip"],"cute":["attract"],"cylind":["shape"],"damag":["harm","impair"],"damn":["curs"],"danger":["unsaf"],"dark":["dark"],"dash":["smash","hurl","thrust"],"date":["appoint","engag","escort"],"daughter":["girl","offspr"],"dawn":["dawn","aurora","daybreak"],"dead":["inanim","lethal"],"deal":["agreement","bargain"],"dealer":["trader"],"death":["deceas","expiri"],"debat":["deliber","disput"],"decad":["decennari","decennium"],"decay":["decomposit","rot"],"decis":["determin"],"declar":["statement"],"declin":["worsen"],"decor":["ornament","cosmet"],"decreas":["diminish","fall","lessen"],"dedic":["inscrib"],"defeat":["frustrat"],"defend":["guard","protect","suspect"],"defici":["insuffici","inadequaci"],"deficit":["shortag","shortfal"],"definit":["precis","explicit"],"degre":["grade","level"],"delay":["holdup","detain"],"delet":["eras"],"delic":["fragil","frail","sensit"],"deliv":["bring"],"deliveri":["birth"],"demolish":["destroy"],"demonstr":["march","demo","protest"],"denial":["disaffirm"],"densiti":["dens"],"deni":["contradict"],"depart":["leav"],"depend":["addict"],"deport":["extradit"],"deposit":["sediment"],"depress":["blue","low","slump"],"depriv":["want","needi"],"deputi":["surrog"],"descent":["decliv","declin","fall"],"describ":["depict"],"desert":["defect"],"deserv":["merit"],"design":["conceiv","invent","innov","outlin","couturi"],"desir":["feel"],"desk":["furnitur"],"despis":["scorn","disdain"],"destruct":["demolit","wipeout"],"detail":["particular","item"],"detect":["investig"],"detector":["sensor"],"deter":["dissuad"],"deterior":["disintegr","degener"],"determin":["influenc"],"develop":["invent","growth","grow","matur"],"deviat":["divers","digress","deflect"],"devot":["dedic","commit"],"diagram":["draw"],"dialect":["idiom"],"dialogu":["dialog","convers"],"diamond":["gem"],"dictionari":["lexicon"],"die":["perish"],"diet":["diet"],"differ":["disput","conflict","remaind","unlik","dissimilar"],"difficult":["hard"],"difficulti":["difficult","troubl"],"digit":["figur","finger","discret"],"digress":["sidetrack","wander","stray"],"dilemma":["quandari"],"dilut":["thin","reduc","cut"],"dimens":["magnitud"],"dinner":["supper"],"diplomat":["diplomat","suav"],"direct":["cours","orient","guidanc","counsel"],"director":["conductor"],"dirti":["obscen","indec","soil","unclean"],"disabl":["disabl","handicap","impair"],"disagre":["differ"],"disagr":["dissens","disson","discord"],"disappear":["vanish"],"disappoint":["letdown"],"disast":["calam","catastroph","tragedi"],"disciplin":["correct","punish"],"disclos":["reveal","expos","divulg"],"disco":["discothequ"],"discount":["deduct"],"discourag":["deter"],"discoveri":["breakthrough","find"],"discreet":["prudent","restrain"],"discrimin":["separ"],"disgrac":["shame","ignomini","dishonor"],"dish":["contain"],"disk":["disc"],"dismiss":["disregard","discount","fire","sack"],"disord":["disorderli","mess"],"displac":["bump"],"display":["exhibit","show","expos"],"disposit":["tempera"],"distanc":["aloof"],"distort":["falsifi","misrepres"],"district":["territori"],"disturb":["disrupt","commot","stir"],"ditch":["dump"],"dive":["plung"],"divid":["split","separ"],"dividend":["bonus"],"doctor":["doc","physician","md","phd"],"document":["paper"],"doll":["toy"],"dollar":["buck"],"domin":["control","masteri"],"dorm":["dormitori"],"doubl":["duplic"],"doubt":["question","dubious","doubt","uncertainti","incertitud","dubieti"],"dozen":["twelv"],"draft":["conscript","draught"],"drain":["drainpip"],"dramat":["theatric"],"draw":["attract","pull","lotteri","represent","artwork"],"dream":["ambit","aspir","dream"],"dress":["cloth"],"dribbl":["drip"],"drink":["beverag","drinkabl","potabl","imbib"],"drive":["driveway","ride","journey"],"drop":["bead","pearl","cliff"],"drug":["dose","medic"],"drum":["barrel","tympan"],"duck":["bird"],"due":["owe"],"duke":["nobleman"],"dull":["bore"],"dump":["discard","dispos"],"duti":["tariff"],"dynam":["dynam"],"eagl":["bird"],"earthquak":["quak","seism"],"east":["east","orient","e"],"echo":["reverber"],"economi":["thrifti","frugal"],"ecstasi":["raptur"],"edit":["public"],"educ":["instruct","teach","pedagogi"],"effect":["consequ","outcom","result","impress","effectu","efficaci"],"effort":["attempt","endeavor"],"egg":["egg","food"],"ego":["egot"],"eject":["expel"],"elabor":["expand","expati","enlarg"],"elect":["vote"],"eleg":["refin","tast"],"element":["compon","constitu"],"eleph":["pachyderm"],"embark":["ventur"],"embarrass":["shame"],"embrac":["hug"],"embryo":["conceptus"],"emerg":["exig","pinch","crisi"],"emot":["feel"],"emphasi":["accent"],"empir":["monarchi","empir"],"employ":["hire","engag"],"employe":["worker"],"end":["boundari","goal","conclus","close","end"],"endors":["second","back","support"],"endur":["last","persist","weather","brave"],"energi":["vigor"],"engag":["betroth"],"engin":["locomot","motor","technologist"],"enlarg":["magnifi"],"ensur":["guarante","insur","assur","secur"],"enter":["enrol","inscrib"],"entertain":["amus"],"entri":["entranc","entranceway","entryway","submiss"],"environ":["environ","surround"],"episod":["instal"],"equal":["like","equival","same"],"equip":["outfit"],"era":["epoch"],"error":["mistak","fault"],"escap":["run","flee"],"essenti":["basic","fundament"],"establish":["instal","accept"],"estim":["esteem","respect","estim","approxim"],"etern":["everlast","perpetu","unend"],"ethnic":["cultur"],"europ":["contin"],"evalu":["valuat","assess","apprais","valu"],"even":["level","flush","eve"],"evok":["suggest"],"evolut":["phylogeni","phylogenesi"],"exact":["precis"],"exagger":["overst"],"examin":["test"],"exampl":["illustr","instanc","repres","exemplar","model"],"excav":["hollow","dig"],"exceed":["pass","top","surpass","outstrip","outmatch","outdo"],"excess":["surplus"],"excit":["agit","turmoil","upheav","hullabaloo","excit","fervor"],"exclud":["except","omit"],"excus":["alibi","exculp","forgiv","pardon"],"execut":["administr"],"exempt":["free","immun"],"exercis":["exercis"],"exhibit":["exposit","expo"],"exil":["deport","expatri","expuls"],"exit":["issu","outlet"],"exot":["foreign","alien","unusu"],"expand":["extend","spread"],"expans":["enlarg"],"expect":["anticip","requir","ask"],"expenditur":["outgo","outlay"],"experienc":["knowledg"],"experi":["experiment","test","investig"],"expertis":["expert"],"explain":["explic"],"explicit":["express"],"explod":["deton"],"explos":["deton","blowup"],"expos":["debunk"],"express":["say","locut"],"extend":["widen","broaden"],"extens":["wing","annex"],"extort":["goug"],"extract":["pull"],"extraterrestri":["alien"],"eye":["oculus","optic"],"eyebrow":["brow"],"fabric":["invent"],"facad":["frontag","frontal"],"facil":["adept","adroit","deft","quick","instal","build","place"],"factori":["mill","manufactori"],"faculti":["instructor","teacher"],"fade":["wither"],"failur":["bankruptci","loser","nonstart"],"fair":["imparti","carniv","funfair"],"fairi":["faeri","sprite"],"faith":["religion"],"fall":["autumn","drop"],"falsifi":["manipul","fake","fudg","cook","misrepres"],"fame":["celebr","renown"],"familiar":["know"],"famili":["household","home","menag","folk","kinfolk","kinsfolk","kin"],"fan":["buff","devote","lover"],"fantasi":["illus","phantasi","fanci"],"farewel":["leav","part"],"fascin":["intrigu"],"fashion":["rage","fad","stylish"],"fastidi":["finicki"],"fate":["destini","fortun","luck","lot","circumst"],"fault":["defect","flaw"],"favor":["encourag","approv"],"favourit":["darl","favorit","pet"],"fax":["facsimil"],"fear":["fear","fright","dread"],"feast":["banquet"],"feather":["plume","plumag"],"featur":["characterist"],"feder":["confeder","confederaci"],"feedback":["respons"],"feel":["experi","touch"],"feign":["sham","pretend","dissembl","simul"],"feminin":["woman"],"fenc":["barrier"],"ferri":["ferryboat"],"fibr":["fiber"],"fig":["fruit"],"fight":["fight","combat","struggl"],"figur":["design","pattern","illustr","digit"],"film":["cinema"],"final":["examin"],"financi":["fiscal"],"find":["discov","recov","retriev","regain"],"fine":["smooth"],"finish":["complet","ruin"],"fire":["flame","ardor","fervor","fervenc","fervid","attack","flak","flack","blast"],"firefight":["fireman"],"fireplac":["fire"],"firm":["hous","compani"],"first":["initi"],"firsthand":["direct"],"fisherman":["fisher"],"fix":["repair","mend"],"flag":["emblem"],"flash":["blink","wink","twinkl","photoflash","flashbulb","flare","heartbeat","instant","jiffi"],"flat":["apart"],"flatwar":["silverwar"],"flavor":["savor","smack","tang"],"flaw":["imperfect","blemish","faulti"],"flesh":["pulp"],"flex":["bend"],"flexibl":["bendabl"],"flight":["escap"],"flood":["inund"],"floor":["floor"],"flourish":["thrive","prosper"],"flow":["run"],"flu":["influenza"],"fluctuat":["waver","instabl"],"flush":["blush","redden"],"fli":["insect"],"fog":["daze","haze","confus"],"fold":["creas","crimp","bend","lie"],"folk":["folk"],"follow":["compli","succeed"],"food":["nutrient"],"fool":["clown","jester","moron"],"foot":["ft"],"forbid":["prohibit","interdict"],"forc":["forc","strength","intens","violenc"],"forecast":["prognosi"],"foreign":["alien","noncitizen"],"forest":["woodland","timberland","timber"],"forg":["fake","counterfeit"],"forget":["block"],"fork":["cutleri"],"form":["shape","pattern","variant","strain"],"format":["format"],"formul":["word","phrase","articul"],"fortun":["luck","wealth","prosper"],"foster":["nurtur"],"foundat":["basi"],"fountain":["font"],"fox":["anim"],"fraction":["quotient"],"frame":["ensnar","entrap"],"franchis":["dealership"],"frank":["candid","blunt","forthright"],"fraud":["fraudul","duperi","hoax"],"free":["complimentari","costless","grati"],"freight":["transport"],"frequenc":["frequenc","often"],"fresh":["insol","impertin","impud","sassi"],"friend":["acquaint"],"frighten":["scare"],"frog":["toad"],"front":["battlefront"],"frown":["glower"],"freez":["unthaw"],"fuel":["energi"],"full":["replet"],"fun":["merriment","play"],"function":["affair","occas"],"fund":["financ","underwrit"],"funer":["ceremoni"],"funni":["amus","laughabl"],"fur":["pelt"],"fuss":["bustl","hustl","flurri","ado","stir"],"futur":["hereaft","futur"],"gaff":["slip"],"gain":["profit","benefit"],"gallon":["gal"],"game":["amus","pastim"],"gap":["crack"],"garag":["build"],"garbag":["refus","wast"],"gas":["gasolin","petrol"],"gasp":["pant","puff","heav"],"gate":["door"],"gem":["gemston","stone"],"general":["offic"],"generat":["produc","coeval","contemporari"],"genet":["genet"],"get":["acquir"],"ghostwrit":["ghost"],"giant":["hulk"],"gift":["present"],"give":["pass","hand","reach","collaps","present","render","yield","return","generat"],"glanc":["peek","glimps"],"glare":["glower"],"glass":["mirror","eyeglass","spectacl"],"global":["univers","worldwid"],"gloom":["gloomi","glum"],"glori":["prestig"],"glove":["handwear"],"glue":["adhes"],"go":["move"],"goal":["finish","destin"],"goalkeep":["goali","goaltend"],"god":["deiti","divin"],"gold":["au"],"good":["benefici","salutari","just","upright","virtuous","commod","good"],"gossip":["scuttlebutt"],"govern":["author","regim"],"grace":["kind"],"graduat":["alumnus","alumna","alum","grad"],"grain":["cereal"],"grand":["luxuri","opul","sumptuous"],"grandfath":["gramp","grandad"],"grandmoth":["grandma"],"graphic":["explicit","descript","pictori","lifelik","vivid"],"grass":["lawn","pot","dope","weed","marijuana"],"grate":["thank"],"grave":["tomb"],"graviti":["grave","sobrieti","sober","somber","gravit"],"graze":["pastur"],"great":["larg","outstand"],"green":["green","environmentalist","virid","unrip","unripen"],"greet":["salut"],"gregari":["sociabl"],"grief":["heartach","heartbreak","brokenhearted"],"grimac":["face"],"grind":["mash","crunch","land","earth"],"grip":["grasp"],"groan":["moan"],"ground":["evid","basi"],"grow":["matur"],"growth":["increas","increment"],"grudg":["grievanc"],"guarante":["warrant","warrante"],"guard":["bodyguard","watchman","ward","shield"],"guerrilla":["insurg"],"guest":["invite"],"guidelin":["guidepost"],"guilt":["guilti"],"gun":["weapon"],"gutter":["trough"],"haircut":["hairstyl"],"hall":["hallway"],"hallway":["passag","corridor"],"halt":["freez","interrupt"],"ham":["meat"],"hand":["manus","mitt","paw","deal"],"handicap":["hinder","hamper"],"hang":["suspend"],"happen":["occur"],"harass":["hassl","plagu","molest"],"harbor":["seaport"],"hardship":["advers"],"harm":["noxious"],"harmoni":["concord","harmoni","compat"],"harsh":["coars"],"hat":["headdress"],"hate":["detest","loath"],"haul":["transport"],"haunt":["stalk"],"head":["chief"],"heal":["cure"],"health":["well"],"healthi":["fit"],"heat":["passion"],"heaven":["paradis"],"height":["altitud"],"heir":["inheritor","heritor"],"helicopt":["chopper"],"hell":["netherworld"],"helmet":["headgear"],"help":["aid","assist","helper","support"],"helpless":["incapacit"],"heroin":["drug"],"hesit":["paus"],"hide":["conceal"],"highway":["expressway","freeway"],"hilari":["uproari"],"histori":["account","chronicl","stori"],"hit":["strike"],"hobbi":["pursuit","hobbi","sidelin"],"hold":["bear","carri","contain","reserv","book"],"holiday":["vacat"],"home":["dwell","domicil","abod","habit"],"homosexu":["gay"],"honest":["sincer"],"honor":["honor","laurel"],"hope":["wish"],"horizon":["skylin"],"horror":["repugn","repuls","revuls"],"hors":["anim","knight","chessman"],"hospit":["infirmari","kind"],"host":["invit","emce"],"hostil":["aggress","enmiti","antagon"],"hot":["vehem","passion"],"hotdog":["frankfurt"],"hour":["hr"],"hous":["dwell","legislatur","lodg"],"housewif":["homemak"],"hover":["levit"],"html":["xhtml"],"huge":["immens","vast"],"human":["human"],"hunter":["huntsman"],"hunt":["hunt"],"hurl":["cast","hurtl"],"hurt":["ach"],"husband":["hubbi"],"hut":["hovel","hutch","shack"],"hypnoth":["mesmer"],"hypothesi":["guess","conjectur","surmis","specul"],"hypothes":["specul","theoriz","conjectur"],"idea":["think"],"ideal":["paragon","model"],"identifi":["name"],"ident":["identic","indistinguish","individu"],"ignit":["light"],"ignor":["naiv","unsophist","neglect","disregard"],"ill":["unwel","maladi","sick"],"illustr":["exemplifi"],"imag":["doubl"],"imagin":["ideat","envisag"],"immun":["resist"],"implicit":["inexplicit"],"import":["import","signific"],"impost":["pretend","fake","faker","sham","fraud"],"impound":["confisc","seiz"],"improv":["better","amend","amelior"],"impuls":["capric","whim"],"incap":["incompet"],"incent":["induc","motiv","carrot"],"inch":["in"],"incid":["event"],"includ":["admit"],"incongru":["discrep"],"increas":["increment"],"incred":["unbeliev"],"indic":["suggest"],"indoor":["insid"],"industri":["dilig","industri","manufactur"],"infect":["contagion","transmiss"],"infinit":["limitless"],"inform":["info"],"inhabit":["habit","dweller","denizen"],"inhibit":["suppress"],"inject":["shoot"],"injur":["wind","hurt"],"injuri":["hurt","harm","trauma"],"inn":["hostel","hostelri","lodg"],"innoc":["guiltless"],"innov":["invent"],"inquiri":["inquest"],"insid":["interior"],"insight":["percept","understand"],"insist":["insist"],"inspector":["examin"],"institut":["establish"],"instruct":["teach","pedagogi"],"instructor":["faculti","teacher"],"instrument":["devic"],"insur":["indemn","protect"],"integr":["desegreg"],"intensifi":["escal"],"intent":["volit"],"interact":["synergist"],"interest":["pastim","pursuit"],"interfer":["hindranc","hitch","prevent","encumbr"],"interrupt":["disrupt"],"intervent":["interfer"],"introduc":["present","acquaint","inaugur"],"introduct":["present","intro"],"invas":["encroach","intrus"],"investig":["probe"],"invis":["unseeabl"],"ironi":["sarcasm","satir"],"item":["token"],"ivori":["tusk"],"jail":["imprison","incarcer"],"jam":["preserv"],"jar":["vessel"],"jealous":["covet","envious"],"jet":["squirt","spurt","spirt"],"jewel":["gem"],"job":["task","chore","workplac"],"jockey":["rider"],"joint":["unit","combin"],"joke":["gag","laugh","jest"],"journal":["diari","period"],"joy":["joyous","joy"],"judg":["justic","jurist","magistr"],"judici":["jurid"],"jump":["leap","bind"],"just":["equit"],"justic":["just"],"justifi":["excus","ration"],"keep":["maintain","preserv","observ","celebr"],"kettl":["boiler"],"key":["tonal","legend"],"kidnap":["snatch","abduct"],"killer":["slayer"],"kingdom":["monarchi"],"kit":["outfit","gear"],"kite":["toy"],"knife":["tool"],"knock":["rap"],"knowledg":["cognit","learn"],"koran":["quran","qur'an"],"laboratori":["lab"],"labour":["toil","proletariat"],"lack":["defici","want"],"ladder":["step"],"land":["kingdom","realm","estat"],"landown":["landhold"],"landscap":["sceneri"],"languag":["terminolog","nomenclatur"],"larg":["big"],"last":["conclud","final","termin"],"late":["belat","tardi"],"latest":["newest","current"],"laundri":["wash","washabl"],"law":["jurisprud","polic"],"lawyer":["attorney"],"layout":["plan","design"],"lazi":["indol","otios","sloth"],"lead":["pb","head"],"leader":["command"],"leadership":["lead"],"leaf":["leafag","foliag"],"leaflet":["brochur","folder","pamphlet"],"lean":["tilt","tip","slant","angl","inclin","bend"],"learn":["memor"],"leas":["rent","let"],"leash":["tether"],"leav":["bequeath","will","exit"],"lectur":["instruct","teach"],"leg":["limb"],"legend":["caption","fabl","stori"],"legisl":["legisl","lawmak"],"lemon":["fruit"],"lend":["loan"],"length":["durat"],"letter":["missiv"],"level":["floor","storey","stori","grade","tier","layer","stratum","raze","rase","dismantl"],"liberti":["freedom"],"licenc":["licens","permit"],"licens":["certifi"],"lick":["lap"],"lid":["eyelid"],"lie":["prevar"],"lift":["elev","rais"],"light":["luminos","bright","lumin","illumin"],"lighter":["ignit"],"like":["probabl","plausibl"],"lili":["flower"],"limit":["limit","demarc"],"line":["argument","demarc","wrinkl","furrow","creas","crinkl","seam"],"lineag":["descent"],"linger":["loiter"],"link":["fasten","connect","tie"],"lip":["brim","rim"],"list":["list","tilt","inclin"],"listen":["hear"],"live":["unrecord"],"liver":["organ"],"load":["burden","weight"],"lobbi":["vestibul","foyer"],"locat":["situat"],"lock":["curl","ringlet","whorl"],"log":["logarithm"],"lone":["alon","lone","solitari"],"look":["appear","seem","search","spirit","tone","feel","flavor"],"loop":["iter"],"loot":["booti","pillag","plunder","prize"],"lot":["deal","flock","heap"],"love":["passion","belov","dear","dearest","honey"],"loyalti":["trueness"],"lump":["chunk","gob","clod"],"lunch":["luncheon"],"machineri":["machin"],"magnitud":["size","extent"],"maid":["maidserv","housemaid"],"mail":["send","post"],"main":["chief","primari","princip"],"make":["produc","creat","gain","clear","earn"],"makeup":["cosmet"],"man":["male","homo","human"],"manag":["overse","supervis","direct","director"],"manual":["handbook"],"manufactur":["fabric","produc"],"marbl":["rock"],"march":["march","month","walk"],"margin":["edg"],"marin":["nautic","maritim"],"mark":["grade","score","scratch","scrape","scar"],"market":["commerci","groceri"],"marriag":["union","matrimoni","wedlock"],"marsh":["marshland","fen","fenland"],"mask":["disguis"],"master":["maestro"],"mastermind":["engin","direct","orchestr","organ"],"match":["peer","equal","compeer","catch","fit","correspond","check","agre","lighter"],"materi":["fabric","cloth","textil","stuff"],"mathemat":["math"],"matter":["substanc","count","weigh"],"matur":["ripe"],"maximum":["maxim"],"maze":["labyrinth"],"meadow":["hayfield"],"meal":["repast"],"mean":["intend","signifi","signific","signif"],"measur":["quantifi"],"medal":["decor","medallion","ribbon"],"medicin":["medic","medica"],"medium":["spiritualist"],"meet":["gather","assembl","encount","liaison"],"memorandum":["memo"],"memori":["commemor","remembr","monument","storag"],"mention":["note","observ","remark"],"merchant":["merchandis","businessperson"],"merci":["clemenc","merci","lenienc"],"merit":["deserving","meritori"],"mess":["fix","jam","muddl","pickl"],"messag":["communic"],"metric":["si"],"microphon":["mike"],"mild":["moder"],"mile":["distanc"],"mill":["grinder"],"mind":["head","brain","intellect"],"miner":["minework"],"minim":["underst","downplay"],"minimum":["minim"],"minist":["pastor","rector"],"minut":["min"],"mirror":["reflector"],"miscarriag":["stillbirth"],"miser":["abject","scummi","contempt"],"miseri":["wretched","miser"],"mislead":["misinform"],"misplac":["lose"],"missil":["projectil","weapon"],"mistreat":["maltreat","abus"],"mix":["shuffl","random"],"mixtur":["mix"],"model":["framework","simul"],"modern":["develop"],"modul":["compon"],"mold":["fungus","mould"],"mole":["counterspi"],"momentum":["impuls","forc"],"monarch":["sovereign"],"money":["currenc","wealth"],"monster":["freak"],"monstrous":["atroci","heinous","grotesqu"],"mood":["temper","humor"],"morn":["morn","forenoon"],"morsel":["bite"],"motif":["design"],"motiv":["motiv","need"],"motorcycl":["motorbik","bike"],"motorist":["automobilist"],"mountain":["mount"],"mourn":["bereav"],"mous":["rodent"],"move":["reloc"],"movement":["motion","move","front"],"movi":["film"],"mud":["clay"],"mug":["cup"],"muggi":["sticki","steami"],"multipli":["calcul"],"murder":["slay","execut"],"mushroom":["fungus"],"mutter":["mumbl","murmur"],"mutual":["reciproc"],"mysteri":["secret","enigma"],"nap":["catnap"],"nation":["patriot"],"nationalist":["patriot"],"neck":["cervix"],"necklac":["chain"],"need":["demand","requir","indig","penuri"],"negat":["disconfirm"],"neglect":["disregard"],"neglig":["neglect"],"negoti":["dialogu","talk"],"neighborhood":["vicin"],"neighbour":["neighbor"],"nervous":["neural","skittish"],"net":["internet","net","cyberspac"],"network":["web"],"new":["unfamiliar","unus"],"news":["intellig","tide","word"],"night":["nighttim","dark"],"nois":["random","haphazard","sound"],"nomin":["propos"],"nonremitt":["default","nonpay"],"nonsens":["bunk","hokum"],"norm":["standard"],"north":["n"],"note":["annot","bill","banknot","tone","line","billet"],"notic":["announc","note","perceiv"],"notion":["concept"],"notori":["infam"],"nuanc":["shade","niceti","subtleti","refin"],"nuclear":["atom"],"number":["numer","quantiti"],"nun":["sister"],"nurseri":["greenhous","glasshous"],"obes":["overweight"],"object":["aim","object","target","nonsubject"],"oblig":["duti","respons"],"obscur":["unknown"],"observ":["perceiv","behold"],"obstacl":["block"],"occupi":["fill"],"offend":["wind","hurt","wrongdoer"],"offens":["discourtesi","offenc","misdemeanor","infract","violat","offens","attack","unpleas","disgust"],"offer":["bid","offer"],"offic":["workplac","policeman"],"offici":["functionari"],"offset":["countervail","compens","counterbal"],"offspr":["progeni","issu","young"],"old":["elder"],"omiss":["skip"],"open":["overt"],"oper":["function","perform","surgeri"],"opinion":["judgment","judgement"],"oppon":["adversari","antagonist"],"opposit":["revers","contrari","enemi","foe","resist"],"oral":["mouth"],"orang":["orang"],"order":["decre","edict","orderli"],"organ":["form"],"orgi":["orgi","debaucheri","saturnalia","bacchan","riot"],"orient":["posit","align"],"origin":["descent","extract","background","proven","fresh","unusu","first"],"ostrac":["shun","blackbal"],"outfit":["getup","cloth"],"outlin":["abstract","preci","lineat"],"outlook":["mental","mindset"],"outsid":["outdoor","exterior","surfac"],"overal":["cloth"],"overcharg":["surcharg","fleec"],"overeat":["gorg"],"overview":["summari"],"overwhelm":["overpow"],"pace":["tempo","rate"],"packag":["bundl","packet","parcel"],"packet":["bundl"],"pain":["pain","nuisanc"],"painter":["artist"],"panic":["terror"],"paper":["composit","report","newspap","cellulos"],"parallel":["analogu","analog"],"paralyz":["paralyt"],"paramet":["factor"],"pardon":["amnesti"],"park":["common","green"],"part":["portion","compon"],"particular":["finicki","fussi","peculiar","special"],"partner":["spous","mate"],"parti":["festiv"],"pass":["overtak","pass"],"passag":["passageway"],"passeng":["rider"],"passion":["passion"],"passiv":["inact"],"password":["watchword","word"],"past":["yesteryear"],"pastur":["pastureland"],"pat":["dab"],"patch":["bandag","plot"],"path":["rout","itinerari"],"patienc":["forbear"],"pattern":["model","design"],"paus":["paus"],"pavement":["sidewalk"],"pawn":["hock"],"pay":["purchas"],"payment":["defray"],"peac":["peac","repos","seren"],"peak":["vertex","apex","acm"],"peanut":["goober"],"pedestrian":["walker"],"peel":["skin","rind"],"pen":["playpen"],"penalti":["punish"],"penni":["cent"],"pepper":["spice"],"perceiv":["sens"],"percent":["percentag"],"perfect":["complet"],"perform":["execut"],"perfum":["essenc"],"period":["point","stop"],"perman":["last"],"persist":["persever","last"],"person":["individu"],"pest":["blighter","cuss","pester","gadfli"],"pet":["anim"],"philosophi":["doctrin","knowledg","ethic"],"photocopi":["xerox"],"photograph":["photo"],"pictur":["imag","icon","paint"],"pie":["dish"],"piec":["opus","composit"],"pierc":["stick","punctur"],"pig":["hog","swine","slob","sloven"],"pile":["heap","mound","stack"],"pillow":["cushion"],"pin":["pin"],"pioneer":["innov","trailblaz","groundbreak"],"pipe":["tube"],"pit":["pitfal","trap","caviti","stone"],"piti":["compass"],"place":["seat","spot"],"plain":["simpl"],"plaintiff":["complain"],"plan":["design","arrang","scheme"],"plane":["airplan","aeroplan"],"plant":["flora","factori"],"plastic":["materi"],"plate":["dish"],"play":["act","roleplay","playact","drama"],"player":["particip","actor"],"pleasant":["delight"],"pleas":["delight"],"pleasur":["delight"],"plot":["stori","game"],"pluck":["pick","cull"],"poetri":["poesi","vers"],"point":["detail","item","dot","tip","peak"],"policeman":["cop"],"polish":["refin","shine"],"polit":["courteous"],"pollut":["contamin"],"pool":["puddl"],"pop":["dad","dada","daddi","pa","papa","soda"],"portion":["help","serv"],"portrait":["portray","like"],"posit":["placement","locat","stanc","postur","status","accept","confirm"],"possess":["ownership"],"possibl":["potenti"],"post":["stake","mail"],"postur":["bear","carriag"],"pot":["flowerpot"],"potenti":["potenti"],"potteri":["claywar"],"pound":["lb"],"power":["forc","might","superpow"],"practic":["effici","exercis","drill","recit","pattern"],"prais":["congratul","kudo"],"prayer":["supplic"],"preced":["predat","anteced","anted"],"predict":["call","foretel","prognost","forebod","project"],"prefer":["favor","predilect","predisposit"],"prejudic":["bias","preconcept"],"prematur":["untim"],"prepar":["readi","prepared"],"prescript":["instruct"],"presenc":["bear","comport"],"present":["gift","nowaday","submit"],"presid":["presidentship","chairman","chairwoman","chair"],"pressur":["imper","insist"],"prestig":["prestigi"],"preval":["preponder"],"prevent":["forestal"],"price":["cost","toll"],"print":["pictur","design"],"prioriti":["preced"],"prison":["captiv"],"privaci":["privat","seclus"],"prize":["trophi"],"problem":["question","troubl"],"process":["procedur"],"proclaim":["exclaim","promulg","state","announc"],"produc":["grow","rais","farm","cultiv"],"product":["merchandis","ware","output","yield","generat"],"profess":["occup"],"professor":["prof"],"profit":["gain"],"profound":["deep"],"program":["broadcast","plan"],"progress":["advanc","gain"],"project":["undertak","task","enterpris"],"promot":["upgrad","advanc","public"],"proper":["suitabl"],"properti":["attribut","dimens","belong","hold"],"proport":["dimens"],"propos":["proposit"],"proposit":["statement"],"prospect":["expect","outlook"],"prosper":["boom","thrive","flourish"],"protest":["object","dissent"],"prove":["show","demonstr","establish"],"provid":["suppli","render","furnish"],"provis":["suppli"],"provok":["arous","evok"],"public":["issu"],"publish":["issu","releas"],"pull":["draw"],"punch":["blow","lick","biff"],"punish":["penal"],"pupil":["schoolchild"],"pure":["sinless"],"purpos":["intent","aim","design"],"pursuit":["quest","search"],"push":["press"],"put":["place","set","pose","lie","posit"],"puzzl":["toy"],"pyramid":["polyhedron"],"qualif":["reserv","limit"],"qualifi":["modifi"],"quantiti":["amount"],"quarrel":["disput","argu","row","wrangl","word","dustup"],"quest":["seek"],"question":["inquiri","queri","interrog"],"quiet":["quiescent","silent"],"quotat":["quot","citat","word"],"quot":["cite"],"race":["rush","hasten","speed","hurri"],"racism":["prejudic"],"radiat":["radioact"],"radio":["radiocommun","wireless","medium"],"rage":["furi","mad"],"raid":["foray"],"railcar":["wagon"],"rain":["rainfal"],"rais":["rear","nurtur","parent"],"random":["arbitrari"],"rang":["scope","reach","orbit","compass","stove"],"rank":["status","rate","place","rang","order","grade"],"rape":["ravish","violat","assault","rape"],"rare":["infrequ","uncommon"],"rat":["rodent"],"rate":["pace"],"reach":["touch"],"reader":["review","refere","subscrib"],"readi":["prepar"],"real":["actual","genuin"],"realism":["pragmat"],"realiti":["real"],"realiz":["recogn"],"reason":["ration","sensibl"],"rebel":["insurg","insurrectionist"],"rebellion":["insurrect","revolt","rise","upris"],"reckless":["foolhardi"],"recognit":["acknowledg"],"recogn":["accredit"],"recommend":["commend","testimoni"],"record":["tape"],"recov":["recuper","convalesc"],"recoveri":["convalesc","recuper","retriev","regain"],"recycl":["reprocess","reus"],"red":["red"],"reduc":["trim"],"reduct":["decreas","diminut"],"redund":["redund","superflu"],"refer":["mention","advert","cite","name","citat","acknowledg","credit","quotat"],"reflect":["shine","medit","ponder","contempl","reflexion"],"refriger":["fridg"],"refund":["repay"],"regard":["gaze"],"regist":["registri"],"registr":["enrol"],"regret":["sorrow","rue","rueful","repent"],"rehabilit":["exoner"],"reinforc":["reward"],"reject":["refus","declin","elimin"],"relat":["link","relat","kin"],"relax":["unwind","easi"],"releas":["free","liber","waiver","discharg"],"relev":["relev"],"reliabl":["depend"],"relief":["eas","allevi"],"relinquish":["renounc","foreswear"],"reluct":["hesit","disinclin"],"remain":["persist"],"remedi":["curat","cure","medicin"],"rememb":["retriev","recal"],"remind":["prompt","cue"],"remuner":["compens"],"repeat":["duplic","redupl","doubl","replic"],"repetit":["repeat"],"replac":["substitut","surrog","altern"],"report":["stori","account","studi","evalu","journalist","newsperson"],"repres":["congressman"],"reproduct":["replica","replic","copi"],"reptil":["reptilian"],"request":["petit"],"requir":["necess","essenti","requisit"],"rescu":["deliv"],"research":["investig"],"reserv":["retic","quiet"],"resid":["abod","occup"],"resign":["quit","surrend"],"resist":["baulk","withstand"],"respect":["esteem","valu"],"respons":["repli","reaction","duti","oblig"],"rest":["breath","remaind","balanc","residu","respit","relief"],"restless":["antsi","itchi","fidgeti"],"restor":["renov","refurbish"],"restrain":["encumb","constrain"],"restraint":["limit"],"restrict":["limit","restrain"],"result":["result","outcom","consequ"],"retain":["rememb","keep"],"retire":["pension"],"retreat":["hideaway"],"return":["homecom","restitut","restor","regain"],"reveal":["uncov"],"reveng":["retali"],"revers":["invert","revers","turnabout","turnaround"],"review":["brushup","period","recapitul","recap","summari","critiqu","retrospect"],"reviv":["resurg","revit","resuscit"],"revok":["lift","annul","revers","repeal","overturn","rescind"],"revolut":["rotat","gyrat"],"reward":["bounti","repay"],"rhythm":["beat"],"rib":["bone"],"rifl":["firearm"],"right":["correct","right"],"ring":["hoop","peal","stave","round"],"rise":["aris","increas","climb","rais","hike","upgrad","flower"],"risk":["peril","gambl","chanc","hazard"],"ritual":["rite"],"road":["rout"],"roar":["bellow"],"robot":["automaton"],"rock":["sway","stone"],"role":["charact","part"],"roll":["bun","bread","roster","rotat"],"romant":["amatori","amor"],"rotat":["turn"],"rotten":["decay","rot","crappi","lousi","shitti","stink","stinki"],"rough":["unsmooth"],"round":["circular"],"rout":["path","itinerari"],"rubbish":["trash","scrap"],"ruin":["downfal","ruinat"],"rule":["govern","regul","convent","pattern","dominion","principl","ruler"],"rumor":["hearsay"],"runner":["athlet"],"rush":["hast","hurri","rush"],"sacrific":["loss"],"sail":["canva"],"sailor":["crewman"],"salesperson":["salesclerk"],"salmon":["fish"],"sandal":["footwear"],"sandwich":["bomber","grinder","hero","hoagi","sub"],"satellit":["orbit"],"satisfact":["content"],"satisfi":["quench","slake"],"sausag":["wurst","meat"],"save":["spare"],"say":["state","tell"],"scan":["skim"],"scandal":["outrag"],"scatter":["sprinkl","dot","dust","dispers"],"scene":["fit","tantrum","connipt","set","shoot"],"scholar":["student"],"school":["schoolhous"],"scrambl":["jumbl","beat"],"scrape":["grate","scratch"],"scratch":["scrape"],"scream":["yell","shriek"],"screw":["tighten","fasten"],"sea":["ocean"],"second":["sec"],"section":["segment"],"sector":["sphere","aspect"],"secular":["laic","lie"],"secur":["protect","fasten","fix"],"see":["understand","realiz","meet","encount"],"seek":["search"],"seem":["appear"],"seiz":["clutch","grab","grasp"],"select":["excerpt","extract","surviv"],"self":["ego"],"seller":["market","vender","vendor"],"seminar":["cours"],"senior":["student"],"sens":["sensat","sentienc","signifi","mean"],"sensit":["sensit"],"sentenc":["convict"],"sentiment":["emot"],"separ":["independ","split","disassoci","divis"],"seri":["serial"],"serious":["sober"],"sermon":["preach","discours"],"serv":["attend","assist"],"servic":["help","assist","overhaul"],"session":["meet"],"set":["adjust","correct","regul"],"settlement":["coloni","resolut","outcom"],"sex":["gender","sexual"],"shadow":["shade"],"shake":["agit"],"shame":["piti"],"shape":["form","work","mold","forg"],"share":["parcel","portion"],"sharehold":["stockhold"],"shatter":["break"],"shed":["spill","disgorg"],"shell":["ammunit","eggshel"],"shift":["switch"],"shine":["glitter","glisten","glint","gleam"],"shirt":["garment"],"shiver":["shudder"],"shock":["offend","scandal","outrag","daze","stupor"],"shoe":["footwear"],"shoot":["spud","germin","sprout","inject","shoot"],"shop":["store","workshop"],"shortag":["dearth","famin"],"shoulder":["berm"],"show":["exhibit","present","demonstr","indic","point","reveal","display"],"shrink":["shrivel"],"shi":["timid","diffid"],"sick":["ill","nausea"],"side":["face","posit","slope","inclin"],"sieg":["besieg","beleagu"],"sight":["vision"],"sign":["auguri","foretoken","preindic","mark","signal","signboard","hous"],"silenc":["quiet","secreci","secret"],"silk":["fabric"],"silver":["metal"],"similar":["alik","like"],"simplic":["simpl","uncomplicated"],"sin":["sin","transgress"],"singer":["vocalist"],"singl":["individu","separ","unmarri"],"sip":["drink"],"sister":["sis"],"site":["websit"],"skeleton":["frame"],"sketch":["cartoon"],"skill":["skill"],"skin":["hide","pelt"],"skirt":["garment"],"slab":["block"],"slam":["bang"],"slant":["pitch"],"sleep":["slumber"],"sleev":["arm"],"slide":["playth","chute","slither"],"slime":["sludg","goo","gunk","muck"],"slip":["skid","slide"],"slipperi":["slippi"],"slogan":["motto","catchword"],"slump":["slouch"],"small":["littl"],"smart":["clever","bright"],"smell":["aroma","odor","odour","scent","olfact"],"smile":["smile","grin"],"smoke":["fume"],"snack":["bite","collat"],"snail":["slug"],"snake":["serpent"],"snap":["click","flick","crack","ruptur"],"snarl":["snap"],"sniff":["whiff","inhal"],"snow":["snowfal"],"snuggl":["cuddl","nestl"],"socialist":["socialist"],"sock":["stock","hosieri"],"sodium":["na"],"sofa":["couch"],"soft":["nonalcohol"],"soil":["territori","dirt"],"soul":["psych"],"sourc":["begin","origin","root","inform"],"south":["confederaci","s"],"space":["blank"],"speaker":["talker","utter","loudspeak"],"speech":["address"],"speed":["veloc","amphetamin","upper"],"spell":["write","charm"],"spend":["expend"],"sphere":["ball"],"spider":["arachnid"],"spin":["whirl","reel","gyrat","revolv"],"spinach":["veget"],"spine":["thorn","prickl"],"spirit":["intent","purport"],"spit":["spew"],"spite":["malic","malici","spite","venom"],"split":["burst","schism"],"spoil":["impair","pamper","coddl","mollycoddl","indulg","rot"],"spokesperson":["interpret","repres"],"spoon":["cutleri"],"sport":["athlet"],"spot":["smudg","blot","daub","smear"],"spray":["scatter"],"spread":["past"],"spring":["fountain","springtim"],"squar":["plaza","place"],"squash":["crush","mash"],"squeez":["pinch","compress","constrict","press","compact"],"stab":["knife"],"stabl":["stall"],"stadium":["bowl","arena"],"staff":["personnel","rod"],"stage":["phase"],"stain":["spot"],"staircas":["stairway"],"stake":["stake","bet","wager"],"stall":["booth","cubicl"],"stamp":["stomp"],"stand":["viewpoint","standpoint","bear","endur","stomach","stall"],"standard":["criterion","measur","touchston"],"star":["asterisk","ace","champion","virtuoso","hotshot","superstar"],"start":["begin","commenc","first","outset"],"state":["provinc"],"statement":["affirm","assert"],"station":["post"],"stem":["stalk"],"step":["footstep","pace","stride","gradat","stair","tread","measur"],"stereotyp":["pigeonhol"],"stick":["adher","bond","bind"],"sticki":["gluey","glutin","gummi"],"still":["inact","motionless","static"],"sting":["bite"],"stitch":["sew"],"stock":["inventori","share","livestock"],"stomach":["tummi","tum"],"stone":["rock"],"stop":["stopov","layov","discontinu","halt"],"storag":["reposit","wareh"],"stori":["narrat","fib"],"straight":["squar","honest","fair","decent"],"strain":["tens"],"strang":["unusu"],"strateg":["strateg"],"straw":["chaff","husk","shuck","stalk"],"strawberri":["fruit"],"stream":["watercours"],"strength":["fort","specialti"],"stress":["emphas","underlin","tension","tens"],"strict":["sever","nonindulg"],"strike":["attack","rap","tap","scratch","expung","excis"],"strikebreak":["scab"],"string":["twine"],"stroke":["fondl","caress","apoplexi"],"stroll":["saunter"],"strong":["firm","potent","secur","unattack","hard"],"structur":["construct"],"stubborn":["obstin"],"student":["pupil","learner"],"studi":["disciplin","subject","report"],"stun":["floor"],"style":["dash","elan","flair","panach"],"subject":["topic","theme"],"substanc":["stuff"],"substitut":["replac"],"suburb":["suburbia"],"subway":["metro","underground","tube"],"suffer":["hurt","ach","pain"],"suggest":["propos","advis","proposit"],"suitcas":["bag","luggag"],"suit":["room"],"sulphur":["sulfur","s"],"summer":["summertim"],"sun":["sunlight","sunshin"],"suntan":["tan","sunburn"],"superintend":["super"],"supplementari":["auxiliari","subsidiari"],"suppli":["backlog","stockpil","reserv","reservoir"],"support":["confirm","corrobor","substanti","document","hold","sustain","keep","livelihood","live","susten"],"suppress":["curb","inhibit"],"surround":["encircl","circl","round"],"survey":["sketch","resum"],"surviv":["endur"],"suspicion":["intuit","hunch","misgiv","mistrust","distrust"],"sustain":["prolong"],"swarm":["pour","teem"],"swear":["curs","cuss","blasphem"],"sweat":["perspir"],"sweet":["dessert"],"swing":["playth","vacil"],"switch":["chang","shift"],"swop":["switch","trade","swap","exchang"],"sword":["blade","weapon"],"symbol":["sign"],"sympathet":["appeal","likeabl"],"system":["scheme"],"tablet":["pill","lozeng","medicin"],"tactic":["tactic","maneuv"],"take":["bring","convey","choos","select"],"talent":["gift"],"talk":["talk","lectur","speak"],"talkat":["chatti","gabbi","garrul"],"tap":["spigot","wiretap"],"target":["mark"],"tast":["prefer","penchant","predilect","gustat"],"tasti":["delici"],"tax":["taxat"],"taxi":["cab","hack","taxicab"],"tea":["beverag"],"teach":["instruct"],"team":["squad"],"tear":["teardrop"],"teas":["rag","taunt","mock"],"techniqu":["profici"],"technolog":["engin"],"teenag":["adolesc"],"telephon":["phone"],"televis":["tv"],"tell":["narrat","recount","recit"],"temporari":["imperman"],"tempt":["entic","lure"],"temptat":["entic"],"tenant":["renter"],"tendenc":["inclin","disposit"],"tender":["gentl","sympathet","feel"],"tens":["taut","rigid"],"tension":["taut"],"term":["word","express","condit"],"termin":["endmost"],"terrac":["patio"],"test":["examin","exam","trial","tryout"],"text":["textbook","schoolbook"],"thaw":["unfreez","unthaw","dethaw","melt"],"theater":["dramaturgi","dramat","theatr"],"theft":["larceni","thieveri","steal"],"theme":["motif"],"theorist":["theoretician","theoriz"],"theori":["hypothesi"],"therapist":["healer"],"thesi":["dissert"],"thin":["lean"],"think":["cogit","cerebr","believ","think"],"thinker":["mind"],"thought":["consider"],"threat":["menac"],"threshold":["doorsil","doorstep"],"throat":["pharynx"],"thrust":["lung","hurl","hurtl"],"thumb":["finger"],"tick":["click"],"ticket":["summon"],"tidi":["neat","order","clean"],"tie":["draw","standoff","neckti","tie"],"tight":["constrain","constrict"],"timber":["lumber"],"time":["clock"],"tip":["gratuiti","lead","point"],"tipto":["tippyto"],"tire":["fatigu"],"titl":["championship","claim","head","deed"],"toast":["bread"],"toler":["recogn"],"tool":["implement"],"top":["peak","crown","crest","tip","summit","upsid"],"toppl":["tip"],"tortur":["tortur"],"toss":["flip","pitch","throw"],"tough":["tough","hard","rough"],"tournament":["tourney"],"tower":["structur"],"toy":["playth"],"trace":["footprint"],"track":["lead","trail","evid","racetrack","racecours","raceway"],"tract":["pamphlet"],"traction":["grip"],"trade":["barter","swap","swop","craft","deal"],"tradit":["custom"],"traffic":["pedestrian","vehicl"],"train":["coach","prepar","educ","groom"],"tranc":["spell"],"transfer":["transmit","transport","channel","transferr","convey"],"transform":["transmut","metamorphos"],"transit":["convers","changeov"],"transpar":["sheer"],"transport":["transport","ship"],"trap":["snare"],"tread":["trampl"],"treat":["handl","address","cover"],"treatment":["discuss","discours","handl"],"treati":["pact","accord"],"trench":["ditch"],"trend":["tendenc"],"trial":["tribul"],"triangl":["trilater"],"tribe":["clan"],"tribut":["testimoni"],"trip":["stumbl"],"trivial":["banal","commonplac"],"trolley":["streetcar","tram"],"troubl":["worri","perturb","distract"],"trouser":["pant"],"truck":["motortruck","lorri"],"trust":["confid","combin","cartel"],"truth":["veriti","trueness"],"tri":["judg","adjud","seek","attempt","essay","sampl","tast"],"tumbl":["toppl"],"tumour":["tumor","neoplasm"],"tune":["melodi","air","strain","adjust"],"tunnel":["passageway"],"turn":["bend","crook"],"twilight":["dusk","nightfal"],"twist":["entwin","wrench"],"twitch":["jerk"],"tycoon":["baron","king","magnat","mogul"],"unawar":["unwit"],"uncertainti":["uncertain","precari"],"underlin":["underscor"],"undermin":["sabotag","countermin","counteract"],"understand":["comprehend","sympath","empath","sympathi","compass"],"undertak":["tackl"],"undress":["disrob"],"unfair":["partial","bias"],"uniform":["unvari"],"uniqu":["unequ","unparallel"],"uniti":["integr","whole"],"unlaw":["illegitim","illicit"],"unlik":["unequ","improb"],"unpleas":["disagre"],"upset":["disturb","troubl","overturn"],"urg":["cheer","inspir"],"urin":["piss","pee","piddl","weewe","water"],"use":["consumpt","function","purpos","role","habit","usag","practic","appli","util"],"utter":["emit"],"vacuum":["void","vacanc","empti"],"vagu":["undefin"],"valley":["vale"],"van":["vehicl"],"variant":["variat"],"variat":["fluctuat"],"varieti":["divers"],"vat":["tub"],"veget":["veggi","green","flora","botani"],"vehicl":["convey"],"version":["adapt"],"vertic":["perpendicular"],"vessel":["contain","watercraft"],"viabl":["feasibl","practic","workabl"],"victori":["triumph"],"view":["opinion","posit","perspect","aspect","prospect","scene","vista","panorama"],"vigor":["strong"],"villag":["settlement"],"violat":["infring"],"visibl":["seeabl"],"visual":["ocular","optic"],"volcano":["mountain"],"volum":["loud","intens","public"],"vote":["ballot","vote","suffrag"],"voter":["elector"],"voucher":["coupon"],"wage":["pay","earn","remuner","salari"],"waist":["waistlin"],"waiter":["server"],"wake":["view"],"wander":["stray","tramp","roam","rambl","rove","rang","drift"],"want":["desir"],"war":["warfar"],"warn":["notifi","admonit"],"wash":["launder","bath","cleans"],"wast":["thriftless","wast","squander","blow"],"watch":["chronograph","timepiec","lookout","sentinel","sentri","observ"],"waterfal":["cascad"],"wave":["beckon"],"way":["mean","agenc","path"],"weak":["fail","flaw"],"wealth":["rich"],"weapon":["arm"],"wed":["marriag","nuptial"],"weight":["barbel"],"welcom":["greet","recept"],"welfar":["wellb"],"west":["west","occid","w"],"wheat":["cereal"],"whip":["lash"],"white":["achromat","caucasian"],"width":["breadth"],"wife":["spous"],"wild":["untam"],"wilder":["wild"],"will":["testament","volit"],"win":["win","profit"],"winner":["victor"],"winter":["wintertim"],"wisecrack":["crack","quip"],"witch":["enchantress","sorceress"],"withdraw":["retreat","backdown","retract","detach"],"wit":["spectat","viewer","watcher","looker"],"wonder":["marvel","question"],"wool":["fabric"],"word":["parol","phrase"],"work":["employ","workplac","oeuvr"],"world":["earth","globe","populac","public","realiti","univers","exist","cosmos","macrocosm"],"worm":["anim"],"worth":["valu"],"wind":["lesion"],"wriggl":["writh","worm","squirm"],"wrist":["carpus"],"writer":["author"],"yard":["ground"],"year":["twelvemonth","yr"],"yearn":["hanker","long"],"young":["youth"],"zone":["region"]
    },
  },
  helpindex: {
    "1":[{"newmds-2/tasklist/table_example.html":"11"}],"10":[{"newmds-2/world/example_with_emoji.html":"1"}],"100":[{"newmds-2/world/example_with_emoji.html":"1"}],"12":[{"newmds-2/world/example_with_emoji.html":"1"}],"15":[{"newmds-2/world/example_with_emoji.html":"1"}],"2":[{"newmds-2/tasklist/table_example.html":"11"},{"newmds-2/markdown_example.html":"1"}],"20":[{"newmds-2/world/example_with_emoji.html":"1"}],"200":[{"newmds-2/world/example_with_emoji.html":"1"}],"234":[{"newmds-2/tasklist/example_task_list.html":"1"}],"25":[{"newmds-2/world/example_with_emoji.html":"2"}],"3":[{"newmds-2/tasklist/table_example.html":"11"},{"newmds-2/markdown_example.html":"1"}],"30":[{"newmds-2/world/example_with_emoji.html":"1"}],"300":[{"newmds-2/world/example_with_emoji.html":"1"}],"4":[{"newmds-2/tasklist/table_example.html":"3"}],"400":[{"newmds-2/world/example_with_emoji.html":"1"}],"5":[{"newmds-2/tasklist/table_example.html":"3"}],"6":[{"newmds-2/tasklist/table_example.html":"3"}],"600":[{"newmds-2/world/example_with_emoji.html":"1"}],"7":[{"newmds-2/tasklist/table_example.html":"3"}],"700":[{"newmds-2/world/example_with_emoji.html":"1"}],"8":[{"newmds-2/world/example_with_emoji.html":"1"}],"800":[{"newmds-2/world/example_with_emoji.html":"1"}],"a":[{"newmds-2/tasklist/example_task_list.html":"16"},{"newmds-2/world/example_with_emoji.html":"14"},{"newmds-2/world/iron/defination_tags.html":"8"},{"newmds-2/world/iron/my_great_heading.html":"8"},{"newmds-2/world/hello_from_mars_examples.html":"3"},{"newmds-2/markdown_example.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"2"}],"add":[{"newmds-2/world/iron/my_great_heading.html":"3"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"addit":[{"newmds-2/world/iron/defination_tags.html":"1"}],"age":[{"newmds-2/world/example_with_emoji.html":"1"}],"all":[{"newmds-2/world/iron/defination_tags.html":"1"}],"also":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"an":[{"newmds-2/world/iron/my_great_heading.html":"3"},{"newmds-2/markdown_code_syntax.html":"1"}],"and":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"32"},{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/world/iron/my_great_heading.html":"2"},{"newmds-2/markdown_example.html":"1"}],"ani":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"anim":[{"newmds-2/world/iron/defination_tags.html":"1"}],"anoth":[{"newmds-2/world/iron/my_great_heading.html":"2"},{"newmds-2/tasklist/example_task_list.html":"1"}],"appl":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"applic":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"as":[{"newmds-2/world/iron/defination_tags.html":"2"}],"asd":[{"newmds-2/tasklist/example_task_list.html":"2"}],"assist":[{"newmds-2/world/iron/defination_tags.html":"1"}],"at":[{"newmds-2/world/example_with_emoji.html":"1"}],"banana":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"be":[{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/world/hello_from_mars_examples.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"block":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"blockquot":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"browser":[{"newmds-2/world/iron/defination_tags.html":"2"}],"by":[{"newmds-2/world/iron/defination_tags.html":"2"}],"camera":[{"newmds-2/world/example_with_emoji.html":"1"}],"can":[{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"capabl":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"cascad":[{"newmds-2/world/iron/defination_tags.html":"2"}],"choic":[{"newmds-2/markdown_example.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"citrus":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"click":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"client":[{"newmds-2/tasklist/example_task_list.html":"1"}],"cluster":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"code":[{"newmds-2/markdown_code_syntax.html":"27"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"column":[{"newmds-2/tasklist/table_example.html":"21"}],"command":[{"newmds-2/world/example_with_emoji.html":"1"}],"content":[{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"control":[{"newmds-2/world/iron/defination_tags.html":"1"}],"convert":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"creat":[{"newmds-2/world/iron/my_great_heading.html":"4"},{"newmds-2/world/iron/defination_tags.html":"1"}],"cross":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"css":[{"newmds-2/world/iron/defination_tags.html":"3"}],"curv":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"def":[{"newmds-2/markdown_code_syntax.html":"1"}],"defin":[{"newmds-2/world/iron/defination_tags.html":"27"}],"describ":[{"newmds-2/world/iron/defination_tags.html":"1"}],"descript":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"design":[{"newmds-2/world/iron/defination_tags.html":"2"}],"display":[{"newmds-2/world/iron/defination_tags.html":"1"}],"dita":[{"newmds-2/tasklist/example_task_list.html":"6"},{"newmds-2/world/example_with_emoji.html":"6"}],"document":[{"newmds-2/markdown_example.html":"2"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"dragon":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"dynam":[{"newmds-2/world/iron/defination_tags.html":"1"}],"e":[{"newmds-2/tasklist/example_task_list.html":"1"}],"easi":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"28"}],"easili":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"editor":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"element":[{"newmds-2/markdown_example.html":"1"}],"email":[{"newmds-2/tasklist/example_task_list.html":"1"}],"emoji":[{"newmds-2/world/example_with_emoji.html":"27"}],"enabl":[{"newmds-2/world/iron/defination_tags.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"even":[{"newmds-2/markdown_example.html":"1"}],"exampl":[{"newmds-2/tasklist/example_task_list.html":"34"},{"newmds-2/world/example_with_emoji.html":"33"},{"newmds-2/markdown_example.html":"27"},{"newmds-2/tasklist/table_example.html":"27"},{"newmds-2/world/hello_from_mars_examples.html":"27"},{"newmds-2/markdown_code_syntax.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"exist":[{"newmds-2/world/iron/my_great_heading.html":"2"}],"file":[{"newmds-2/markdown_example.html":"1"}],"finish":[{"newmds-2/tasklist/example_task_list.html":"1"}],"first":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"firstnam":[{"newmds-2/world/example_with_emoji.html":"1"}],"flexibl":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"footnot":[{"newmds-2/world/iron/defination_tags.html":"2"}],"for":[{"newmds-2/world/iron/defination_tags.html":"4"},{"newmds-2/markdown_example.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"format":[{"newmds-2/markdown_example.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"2"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"forum":[{"newmds-2/markdown_example.html":"1"}],"fourth":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"from":[{"newmds-2/world/hello_from_mars_examples.html":"29"}],"fruit":[{"newmds-2/tasklist/example_task_list.html":"3"},{"newmds-2/world/iron/my_great_heading.html":"3"},{"newmds-2/world/hello_from_mars_examples.html":"2"}],"great":[{"newmds-2/world/iron/my_great_heading.html":"27"}],"greet":[{"newmds-2/markdown_code_syntax.html":"1"}],"grow":[{"newmds-2/world/hello_from_mars_examples.html":"2"}],"have":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"head":[{"newmds-2/world/iron/my_great_heading.html":"27"}],"header":[{"newmds-2/tasklist/table_example.html":"3"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"headphon":[{"newmds-2/world/example_with_emoji.html":"1"}],"heiiii":[{"newmds-2/markdown_example.html":"1"}],"hello":[{"newmds-2/world/hello_from_mars_examples.html":"29"},{"newmds-2/markdown_example.html":"2"},{"newmds-2/markdown_code_syntax.html":"1"},{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"}],"here":[{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_code_syntax.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"hi":[{"newmds-2/tasklist/example_task_list.html":"1"}],"html":[{"newmds-2/world/iron/defination_tags.html":"4"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"}],"hyper":[{"newmds-2/world/example_with_emoji.html":"1"}],"hypertext":[{"newmds-2/world/iron/defination_tags.html":"1"}],"iamg":[{"newmds-2/markdown_example.html":"2"}],"imag":[{"newmds-2/world/iron/defination_tags.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"import":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"in":[{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"includ":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"ineer":[{"newmds-2/markdown_example.html":"2"}],"inform":[{"newmds-2/world/iron/defination_tags.html":"1"}],"inner":[{"newmds-2/markdown_example.html":"4"}],"intuit":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"is":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"30"},{"newmds-2/tasklist/example_task_list.html":"8"},{"newmds-2/world/example_with_emoji.html":"8"},{"newmds-2/world/iron/defination_tags.html":"7"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"it":[{"newmds-2/world/iron/defination_tags.html":"5"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"2"},{"newmds-2/markdown_example.html":"1"}],"item":[{"newmds-2/world/iron/my_great_heading.html":"9"},{"newmds-2/tasklist/example_task_list.html":"1"}],"java":[{"newmds-2/markdown_example.html":"1"}],"javascript":[{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/markdown_example.html":"1"}],"john":[{"newmds-2/world/example_with_emoji.html":"1"}],"juici":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"languag":[{"newmds-2/world/iron/defination_tags.html":"6"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"laptop":[{"newmds-2/world/example_with_emoji.html":"1"}],"lastnam":[{"newmds-2/world/example_with_emoji.html":"1"}],"learn":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"28"}],"lightweight":[{"newmds-2/markdown_example.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"like":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"link":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"list":[{"newmds-2/tasklist/example_task_list.html":"27"},{"newmds-2/markdown_example.html":"3"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"long":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"make":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"manag":[{"newmds-2/tasklist/example_task_list.html":"1"}],"mani":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"mar":[{"newmds-2/world/hello_from_mars_examples.html":"29"}],"mark":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"markdown":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"31"},{"newmds-2/markdown_code_syntax.html":"28"},{"newmds-2/markdown_example.html":"28"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"markup":[{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"meet":[{"newmds-2/tasklist/example_task_list.html":"1"}],"messag":[{"newmds-2/markdown_example.html":"1"}],"monday":[{"newmds-2/tasklist/example_task_list.html":"1"}],"more":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"much":[{"newmds-2/world/iron/defination_tags.html":"1"}],"multimedia":[{"newmds-2/world/iron/defination_tags.html":"1"}],"my":[{"newmds-2/world/iron/my_great_heading.html":"28"}],"name":[{"newmds-2/markdown_code_syntax.html":"2"},{"newmds-2/world/iron/defination_tags.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"nano":[{"newmds-2/world/example_with_emoji.html":"1"}],"navig":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"need":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"nest":[{"newmds-2/markdown_example.html":"6"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"new":[{"newmds-2/world/iron/my_great_heading.html":"4"}],"of":[{"newmds-2/tasklist/example_task_list.html":"6"},{"newmds-2/world/example_with_emoji.html":"6"},{"newmds-2/markdown_example.html":"3"},{"newmds-2/markdown_code_syntax.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"on":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"one":[{"newmds-2/markdown_example.html":"3"}],"onlin":[{"newmds-2/markdown_example.html":"1"}],"option":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"or":[{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"orang":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"order":[{"newmds-2/world/iron/my_great_heading.html":"2"}],"other":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"pdf":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"php":[{"newmds-2/markdown_example.html":"1"}],"plain":[{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"plaintext":[{"newmds-2/markdown_example.html":"1"}],"platform":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"popular":[{"newmds-2/markdown_example.html":"1"}],"portabl":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"prepar":[{"newmds-2/tasklist/example_task_list.html":"1"}],"present":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"price":[{"newmds-2/world/example_with_emoji.html":"1"}],"print":[{"newmds-2/markdown_code_syntax.html":"1"}],"printer":[{"newmds-2/world/example_with_emoji.html":"1"}],"product":[{"newmds-2/world/example_with_emoji.html":"1"}],"program":[{"newmds-2/world/iron/defination_tags.html":"1"}],"project":[{"newmds-2/world/iron/my_great_heading.html":"11"},{"newmds-2/tasklist/example_task_list.html":"1"}],"prompt":[{"newmds-2/world/example_with_emoji.html":"1"}],"provid":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"quantiti":[{"newmds-2/world/example_with_emoji.html":"1"}],"quarter":[{"newmds-2/tasklist/example_task_list.html":"1"}],"qwe":[{"newmds-2/tasklist/example_task_list.html":"1"}],"rang":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"readm":[{"newmds-2/markdown_example.html":"1"}],"refer":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"report":[{"newmds-2/tasklist/example_task_list.html":"1"}],"row":[{"newmds-2/tasklist/table_example.html":"21"}],"same":[{"newmds-2/world/iron/defination_tags.html":"1"}],"sampl":[{"newmds-2/world/example_with_emoji.html":"1"}],"script":[{"newmds-2/world/iron/defination_tags.html":"1"}],"sda":[{"newmds-2/tasklist/example_task_list.html":"1"}],"sdfsdfddfsdasd":[{"newmds-2/tasklist/example_task_list.html":"1"}],"sds":[{"newmds-2/tasklist/example_task_list.html":"1"}],"second":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"select":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"send":[{"newmds-2/tasklist/example_task_list.html":"1"}],"sentenc":[{"newmds-2/world/example_with_emoji.html":"1"}],"servic":[{"newmds-2/world/iron/my_great_heading.html":"5"}],"sfsdfsdfsdfdsfd":[{"newmds-2/tasklist/example_task_list.html":"1"}],"sheet":[{"newmds-2/world/iron/defination_tags.html":"3"}],"simpl":[{"newmds-2/tasklist/example_task_list.html":"6"},{"newmds-2/world/example_with_emoji.html":"6"}],"simplic":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"smartphon":[{"newmds-2/world/example_with_emoji.html":"1"}],"smartwatch":[{"newmds-2/world/example_with_emoji.html":"1"}],"smith":[{"newmds-2/world/example_with_emoji.html":"1"}],"sms":[{"newmds-2/world/iron/my_great_heading.html":"7"}],"so":[{"newmds-2/world/iron/defination_tags.html":"1"}],"softwar":[{"newmds-2/tasklist/example_task_list.html":"1"}],"some":[{"newmds-2/world/iron/defination_tags.html":"1"}],"stand":[{"newmds-2/world/iron/defination_tags.html":"2"}],"standard":[{"newmds-2/world/iron/defination_tags.html":"1"}],"straightforward":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"style":[{"newmds-2/world/iron/defination_tags.html":"3"}],"sublist":[{"newmds-2/world/iron/my_great_heading.html":"4"}],"subscript":[{"newmds-2/world/example_with_emoji.html":"1"}],"subsect":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"}],"such":[{"newmds-2/world/iron/defination_tags.html":"2"}],"superscript":[{"newmds-2/world/example_with_emoji.html":"1"}],"support":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"3"}],"syntax":[{"newmds-2/markdown_code_syntax.html":"28"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"tabl":[{"newmds-2/tasklist/table_example.html":"27"}],"tablet":[{"newmds-2/world/example_with_emoji.html":"1"}],"tag":[{"newmds-2/world/iron/defination_tags.html":"27"}],"task":[{"newmds-2/tasklist/example_task_list.html":"27"}],"technolog":[{"newmds-2/world/iron/defination_tags.html":"1"}],"text":[{"newmds-2/world/example_with_emoji.html":"3"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_example.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"that":[{"newmds-2/world/hello_from_mars_examples.html":"2"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_example.html":"1"}],"the":[{"newmds-2/world/iron/my_great_heading.html":"7"},{"newmds-2/world/iron/defination_tags.html":"4"},{"newmds-2/tasklist/example_task_list.html":"2"},{"newmds-2/world/example_with_emoji.html":"2"}],"third":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"thire":[{"newmds-2/world/iron/my_great_heading.html":"1"}],"this":[{"newmds-2/tasklist/example_task_list.html":"8"},{"newmds-2/world/example_with_emoji.html":"8"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"three":[{"newmds-2/markdown_example.html":"3"}],"to":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"29"},{"newmds-2/world/iron/my_great_heading.html":"8"},{"newmds-2/world/iron/defination_tags.html":"3"},{"newmds-2/markdown_example.html":"2"},{"newmds-2/tasklist/example_task_list.html":"1"}],"tool":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"topic":[{"newmds-2/tasklist/example_task_list.html":"7"},{"newmds-2/world/example_with_emoji.html":"7"}],"tree":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"two":[{"newmds-2/markdown_example.html":"3"}],"type":[{"newmds-2/world/example_with_emoji.html":"1"}],"unord":[{"newmds-2/world/iron/my_great_heading.html":"2"}],"updat":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"usd":[{"newmds-2/world/example_with_emoji.html":"1"}],"use":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"28"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/markdown_example.html":"1"}],"veri":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"versatil":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"view":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"we":[{"newmds-2/tasklist/example_task_list.html":"1"}],"web":[{"newmds-2/world/iron/defination_tags.html":"2"}],"werwer":[{"newmds-2/tasklist/example_task_list.html":"1"}],"wide":[{"newmds-2/markdown_is_easy_to_learn_and_use.html":"2"}],"with":[{"newmds-2/world/example_with_emoji.html":"28"},{"newmds-2/world/iron/my_great_heading.html":"3"},{"newmds-2/markdown_example.html":"2"},{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/world/hello_from_mars_examples.html":"1"}],"within":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/example_with_emoji.html":"1"},{"newmds-2/world/iron/defination_tags.html":"1"}],"word":[{"newmds-2/world/hello_from_mars_examples.html":"1"}],"write":[{"newmds-2/markdown_example.html":"1"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"1"}],"written":[{"newmds-2/world/iron/defination_tags.html":"1"}],"xml":[{"newmds-2/world/iron/defination_tags.html":"1"}],"xyz":[{"newmds-2/markdown_code_syntax.html":"15"},{"newmds-2/markdown_example.html":"15"},{"newmds-2/markdown_is_easy_to_learn_and_use.html":"15"},{"newmds-2/tasklist/example_task_list.html":"15"},{"newmds-2/tasklist/table_example.html":"15"},{"newmds-2/world/example_with_emoji.html":"15"},{"newmds-2/world/hello_from_mars_examples.html":"15"},{"newmds-2/world/iron/defination_tags.html":"15"},{"newmds-2/world/iron/my_great_heading.html":"15"}],"yellow":[{"newmds-2/tasklist/example_task_list.html":"1"},{"newmds-2/world/iron/my_great_heading.html":"1"}],"you":[{"newmds-2/world/iron/defination_tags.html":"2"},{"newmds-2/world/iron/my_great_heading.html":"2"},{"newmds-2/markdown_example.html":"1"}],"your":[{"newmds-2/world/iron/my_great_heading.html":"1"}]
  },
  topicsummaries: {
    "newmds-2/markdown_code_syntax.html":{"searchtitle":"Markdown Code syntax","shortdesc":""},"newmds-2/markdown_example.html":{"searchtitle":"Markdown Example","shortdesc":""},"newmds-2/markdown_is_easy_to_learn_and_use.html":{"searchtitle":"Markdown is easy to learn and use","shortdesc":""},"newmds-2/tasklist/example_task_list.html":{"searchtitle":"Example task list","shortdesc":""},"newmds-2/tasklist/table_example.html":{"searchtitle":"table example","shortdesc":""},"newmds-2/world/example_with_emoji.html":{"searchtitle":"Example with Emoji","shortdesc":""},"newmds-2/world/hello_from_mars_examples.html":{"searchtitle":"Hello from mars examples","shortdesc":""},"newmds-2/world/iron/defination_tags.html":{"searchtitle":"Defination Tags","shortdesc":""},"newmds-2/world/iron/my_great_heading.html":{"searchtitle":"My Great Heading","shortdesc":""}
  },
};
(function () {
  ditasearch.init();
})();
