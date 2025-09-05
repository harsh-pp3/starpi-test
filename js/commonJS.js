// Dita Search hide extra box --
document.addEventListener("DOMContentLoaded", () => {
  const ditasearch = document.getElementsByClassName("ditasearch")[0];
  ditasearch.classList.add("d-none")
})


// Set ditamap title below log and right side of the logo 
document.addEventListener("DOMContentLoaded", () => {
  const pageTitle = document.title;
  const mainDitaMapTitle = document.querySelectorAll(".mainDitaMapTitle");
  const arrLink = window.location.pathname.split("/")
  if (window.location.pathname === "/") {
    localStorage.setItem("DitaMapTitle", pageTitle);
  } else if (arrLink[arrLink.length - 1] === "index.html") {
    localStorage.setItem("DitaMapTitle", pageTitle);
  }

  const storedPageTitle = localStorage.getItem("DitaMapTitle");

  mainDitaMapTitle.forEach((item) => {
    item.innerText = storedPageTitle;
  });
});


// ------------------------------------------------------ Left Sidebar Code  - Folder icon and Other functions

document.addEventListener("DOMContentLoaded", () => {
  const sidebarIconAndTitle = document.querySelectorAll(
    "#sidebar_menulist > li.list_style_border"
  );

  sidebarIconAndTitle.forEach((li) => {
    const divv = li.querySelector("div");
    if (divv !== null) {
      if (divv.querySelector("a") !== null) {
        const AClone = divv.querySelector("a").cloneNode(true);

        const originaLI = divv.querySelector("a");
        // originaLI.classList.add("d-none");
        originaLI.remove();

        const divElement = document.createElement("div");
        divElement.classList.add(
          "d-flex",
          "align-items-center",
          "iconAndTitle"
        );
        divv.insertBefore(divElement, divv.firstChild);

        divElement.appendChild(AClone);
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const iconAndTitle = document.querySelectorAll(
    "#myUL > ul.map > li > div.caret > .iconAndTitle"
  );
  const iconAndTitle2 = document.querySelectorAll(
    "#myUL2 > ul.map > li > div.caret > .iconAndTitle"
  );
  const sidebarIconAndTitle = document.querySelectorAll(
    "#sidebar_menulist > li.list_style_border > div > div.iconAndTitle"
  );

  // single module Scenario
  const iconAndTitle4 = document.querySelectorAll("#myUL > ul.map > li > a");
  const iconAndTitle5 = document.querySelectorAll("#myUL2 > ul.map > li > a");

  //  iconAndTitle.length === 0 && iconAndTitle4 !== 0

  // console.log(iconAndTitle)
  if (iconAndTitle4 !== 0 || iconAndTitle5 !== 0) {
    const iconAndTitle6 = document.querySelectorAll("#myUL li");
    const mbileLiList = document.querySelectorAll("#myUL2 li");

    function processListItems(nodeList) {
      nodeList.forEach((li) => {
        var nestedDiv = li.querySelector(".nested");
        if (!li.classList.contains("topichead")) {
          if (nestedDiv) {
            li.classList.add("topichead");
            if (!li.querySelector(".caret")) {
              const aaClone = li.querySelector("a").cloneNode(true);
              const originaA = li.querySelector("a");
              // originaA.classList.add("d-none");
              originaA.remove();

              var svg = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
              );
              svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
              svg.setAttribute("class", "menu__icon");
              svg.setAttribute("width", "25");
              svg.setAttribute("height", "25");
              svg.setAttribute("viewBox", "0 0 24 24");
              svg.classList.add("dynamicSVGSingleModule");

              var path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
              );
              path.setAttribute("fill", "#000000");
              path.setAttribute(
                "d",
                "M11.7 15.3q-.475.475-1.087.213T10 14.575v-5.15q0-.675.613-.938T11.7 8.7l2.6 2.6q.15.15.225.325T14.6 12q0 .2-.075.375t-.225.325l-2.6 2.6Z"
              );

              svg.appendChild(path);
              svg.addEventListener("click", function (event) {
                // Your click event logic here
              });

              const divElement = document.createElement("div");
              divElement.classList.add(
                "caret",
                "d-flex",
                "justify-content-between"
              );
              li.insertBefore(divElement, li.firstChild);
              divElement.appendChild(svg);

              const childDivElement = document.createElement("div");
              childDivElement.classList.add(
                "d-flex",
                "align-items-center",
                "singleModuleATag"
              );

              childDivElement.appendChild(aaClone);

              divElement.insertBefore(childDivElement, divElement.firstChild);
            } else {
              if (
                li.querySelector("a").innerHTML.trim() === "Library Catalogs"
              ) {
                const aaClone = li.querySelector("a").cloneNode(true);
                const originaA = li.querySelector("a");
                // originaA.classList.add("d-none");
                originaA.remove();

                var svg = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "svg"
                );
                svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                svg.setAttribute("class", "menu__icon");
                svg.setAttribute("width", "25");
                svg.setAttribute("height", "25");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.classList.add("dynamicSVGSingleModule");

                var path = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path"
                );
                path.setAttribute("fill", "#000000");
                path.setAttribute(
                  "d",
                  "M11.7 15.3q-.475.475-1.087.213T10 14.575v-5.15q0-.675.613-.938T11.7 8.7l2.6 2.6q.15.15.225.325T14.6 12q0 .2-.075.375t-.225.325l-2.6 2.6Z"
                );

                svg.appendChild(path);
                svg.addEventListener("click", function (event) {
                  // Your click event logic here
                });

                const divElement = document.createElement("div");
                divElement.classList.add(
                  "caret",
                  "d-flex",
                  "justify-content-between"
                );
                li.insertBefore(divElement, li.firstChild);
                divElement.appendChild(svg);

                const childDivElement = document.createElement("div");
                childDivElement.classList.add(
                  "d-flex",
                  "align-items-center",
                  "singleModuleATag"
                );

                childDivElement.appendChild(aaClone);

                divElement.insertBefore(childDivElement, divElement.firstChild);
              }
            }
          } else {
            li.classList.add("topichead", "singleModuleATag", "d-flex");
            // Additional logic for elements with 'topichead' class
          }
        }
      });
    }

    // Apply the logic to iconAndTitle6 NodeList
    processListItems(iconAndTitle6);

    // Apply the same logic to mbileLiList NodeList
    processListItems(mbileLiList);
  }

  // ============================================================================================================

  // To change the folder icon of the Left side bar.. replace below `<svg> </svg>` code with your new svg code
  const pathArr = [
    `  
      <svg width="20" height="20" viewBox="0 0 20 20" fill="#12636A" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask0_3_2838" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
      <rect width="20" height="20" fill="#12636A"/>
      </mask>
      <g mask="url(#mask0_3_2838)">
      <path d="M3.33329 16.6667C2.87496 16.6667 2.4826 16.5035 2.15621 16.1771C1.82982 15.8507 1.66663 15.4584 1.66663 15V5.00004C1.66663 4.54171 1.82982 4.14935 2.15621 3.82296C2.4826 3.49657 2.87496 3.33337 3.33329 3.33337H7.64579C7.86802 3.33337 8.07982 3.37504 8.28121 3.45837C8.4826 3.54171 8.65968 3.65976 8.81246 3.81254L9.99996 5.00004H16.6666C17.125 5.00004 17.5173 5.16324 17.8437 5.48962C18.1701 5.81601 18.3333 6.20837 18.3333 6.66671V15C18.3333 15.4584 18.1701 15.8507 17.8437 16.1771C17.5173 16.5035 17.125 16.6667 16.6666 16.6667H3.33329ZM3.33329 5.00004V15H16.6666V6.66671H9.31246L7.64579 5.00004H3.33329Z" fill="#000000"/>
      </g>
      </svg>
    `,
  ];

  function insertSVGIcons(elements) {
    elements.forEach((li, index) => {
      const svgElement = document.createElement("div");
      const pathIndex = index % pathArr.length;
      svgElement.innerHTML = pathArr[pathIndex];
      li.insertBefore(svgElement, li.firstChild);
    });
  }

  const forSingleModuleIcon = document.querySelectorAll(
    "#myUL > ul.map > li > div.caret > .singleModuleATag"
  );
  const forSingleModuleIcon2 = document.querySelectorAll(
    "#myUL > ul.map > li.singleModuleATag"
  );

  const forSingleModuleIcon3 = document.querySelectorAll(
    "#myUL2 > ul.map > li > div.caret > .singleModuleATag"
  );
  const forSingleModuleIcon4 = document.querySelectorAll(
    "#myUL2 > ul.map > li.singleModuleATag"
  );

  insertSVGIcons(iconAndTitle);
  insertSVGIcons(iconAndTitle2);
  insertSVGIcons(sidebarIconAndTitle);
  insertSVGIcons(forSingleModuleIcon);
  insertSVGIcons(forSingleModuleIcon2);
  insertSVGIcons(forSingleModuleIcon3);
  insertSVGIcons(forSingleModuleIcon4);
});


// Focus on input field when modal open
document.addEventListener("DOMContentLoaded", () => {
  const myModal = document.getElementById('searchBoxModal');

  myModal.addEventListener('shown.bs.modal', () => {
    const ditaSearchInput = document.querySelector(".ditaSearchInput")
    ditaSearchInput.focus();
  });
});

// Clear input field when modal close
document.addEventListener("DOMContentLoaded", () => {
  const myModal = document.getElementById("searchBoxModal");

  myModal.addEventListener("hidden.bs.modal", () => {
    const ditaSearchInput = document.querySelector(".ditaSearchInput");
    const ditasearchOl = document.querySelector(".ditasearch > nav > ol");
    ditaSearchInput.value = "";
    ditasearchOl.innerHTML = "";
  });
});


//======================================================== Dita Search and Highlight function
document.addEventListener("DOMContentLoaded", () => {
  var inputElement = document.querySelector('.ditaSearchInput');

  function wrapMatchedText(li, inputValue) {
    const anchor = li.querySelector("a");
    const text = anchor.innerText;

    // Check if the entire inputValue exists in the text
    if (text.toLowerCase().includes(inputValue.toLowerCase())) {
      const highlightedText = text.replace(
        new RegExp(inputValue, "gi"),
        `<span class="searchKeywordHighlighted">$&</span>`
      );
      anchor.innerHTML = highlightedText;
    }
  }

  function myFunction(inputValue) {
    setTimeout(() => {
      const ditasearch = document.querySelectorAll(".ditasearch > nav ol > li");
      ditasearch.forEach((li) => {
        setTimeout(() => {
          wrapMatchedText(li, inputValue);
        }, 500)
      });
    }, 1000);
  }

  inputElement.addEventListener('input', function() {
    myFunction(this.value);
  });
});


// If Mobile Menu is opened and user open sidebar menu then it will be closed automatically
document.addEventListener("DOMContentLoaded", () => {
  const offCanvas = document.getElementById('bdSidebar');

  if(offCanvas !== null){
    offCanvas.addEventListener('shown.bs.offcanvas', () => {
      const navbarToggler = document.querySelector('.menuButtonRight');
  
      if (navbarToggler.getAttribute('aria-expanded') === "true") {
        navbarToggler.click();
      }
    });
  }
});


// Set value for the  download='' from local Storage -- download pdf button
document.addEventListener("DOMContentLoaded", () => {
    const dwnlAndLoader = document.getElementById("dwnlAndLoader")
    const storedPageTitle = localStorage.getItem("DitaMapTitle");
    
    if (storedPageTitle && storedPageTitle.trim() !== "") {
        dwnlAndLoader.download = storedPageTitle;
    } else {
        dwnlAndLoader.download = "docs";
    }
})




// Highlight searched keyword in the content page
document.addEventListener("DOMContentLoaded", () => {
  let currenthref = window.location.href;
  const url = new URL(currenthref);
  let urlQuery = url.searchParams.get("query");
  const bodyContent = document.querySelector(".body");
  const bodyHeading = document.querySelector("article > .topictitle1");
  const keywords = [];

  function highlightKeywords(element, keywords) {
    keywords.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");
      element.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const replacedText = text.replace(
            regex,
            (match) => `<span class="highlightedKeyword">${match}</span>`
          );

          const span = document.createElement("span");
          span.innerHTML = replacedText;

          node.parentNode.replaceChild(span, node);
        } else if (node.nodeType === 1) {
          highlightKeywords(node, keywords);
        }
      });
    });
  }

  if (urlQuery) {
    keywords.push(urlQuery.trim());
    // urlQuery = urlQuery.replaceAll(",", "").replaceAll(".", "");
    highlightKeywords(bodyHeading, keywords);
    highlightKeywords(bodyContent, keywords);
  }
});



  // =============================================== Print Function 
  function printPage() {

    window.scrollTo(0, 0);
  
    setTimeout(() => {
  
    let elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(function(element) {
      element.style.display = 'none';
    });
  
    window.print();
  
    elementsToHide.forEach(function(element) {
      element.style.display = '';
    });
    }, 500)
  }

    