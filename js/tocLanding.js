// ========================================================== Landing Page Big Cards 
document.addEventListener("DOMContentLoaded", () => {
  const ulElement = document.querySelector('.map');
  const allLiElements = ulElement.querySelectorAll('li');
  const landing__card = document.getElementById("landing__card");
  const bigCardText = document.getElementById("bigCardText");
  const menu__wrapper = document.querySelector(".menu__wrapper")
  const mainCategoryFistTime = document.querySelector(".mainCategoryFistTime")



  const liElements = Array.from(allLiElements).filter((liElement) => {
    return liElement.parentElement === ulElement;
  });

  let clickedIndex = 0;

  const colElement = document.createElement('li');
  colElement.className = 'topicref topichead';

  // Function to attach accordion listeners
  function attachAccordionListeners() {
    const toggler = colElement.getElementsByClassName("caret");
    for (let i = 0; i < toggler.length; i++) {
      toggler[i].addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("tocActive");
        this.classList.toggle("caret-down");
      });
    }
  }


  const updateBigCard = () => {
    colElement.innerHTML = liElements[clickedIndex].innerHTML;
    // attachAccordionListeners(); 
  };

  liElements.forEach((liElement, index) => {
        const divElement = liElement.querySelector('div');

    
    divElement.setAttribute('id', divElement.innerText.trim().replace(/\s/g, ""));

    const h5Element = document.createElement('h6');
    h5Element.className = 'card-title landingCardTitle d-flex align-items-center';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'card_span';

    const svgSpan = document.createElement('span');
    svgSpan.className = 'svgSpan';

    // landing page 4 cards icon     
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("width", "20");
    svgElement.setAttribute("height", "21");
    svgElement.setAttribute("viewBox", "0 0 25 26");
    svgElement.setAttribute("fill", "none");


    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", "M11.25 15.2867H13.75C14.1042 15.2867 14.401 15.1695 14.6406 14.9348C14.8803 14.7003 15 14.4096 15 14.0629C15 13.7162 14.8803 13.4256 14.6406 13.1909C14.401 12.9564 14.1042 12.8391 13.75 12.8391H11.25C10.8958 12.8391 10.599 12.9564 10.3594 13.1909C10.1198 13.4256 9.99999 13.7162 9.99999 14.0629C9.99999 14.4096 10.1198 14.7003 10.3594 14.9348C10.599 15.1695 10.8958 15.2867 11.25 15.2867ZM11.25 11.6154H18.75C19.1041 11.6154 19.4011 11.4981 19.6407 11.2635C19.8802 11.029 20.0001 10.7383 20.0001 10.3916C20.0001 10.0448 19.8802 9.75421 19.6407 9.51964C19.4011 9.28509 19.1041 9.16781 18.75 9.16781H11.25C10.8958 9.16781 10.599 9.28509 10.3594 9.51964C10.1198 9.75421 9.99999 10.0448 9.99999 10.3916C9.99999 10.7383 10.1198 11.029 10.3594 11.2635C10.599 11.4981 10.8958 11.6154 11.25 11.6154ZM11.25 7.94404H18.75C19.1041 7.94404 19.4011 7.82676 19.6407 7.59219C19.8802 7.35764 20.0001 7.06699 20.0001 6.72025C20.0001 6.37352 19.8802 6.08287 19.6407 5.84831C19.4011 5.61376 19.1041 5.49648 18.75 5.49648H11.25C10.8958 5.49648 10.599 5.61376 10.3594 5.84831C10.1198 6.08287 9.99999 6.37352 9.99999 6.72025C9.99999 7.06699 10.1198 7.35764 10.3594 7.59219C10.599 7.82676 10.8958 7.94404 11.25 7.94404ZM7.5 20.1819C6.81249 20.1819 6.22395 19.9422 5.73436 19.4629C5.24478 18.9835 4.99999 18.4073 4.99999 17.7343V3.04892C4.99999 2.37585 5.24478 1.79966 5.73436 1.32034C6.22395 0.841029 6.81249 0.601379 7.5 0.601379H22.5C23.1876 0.601379 23.776 0.841029 24.2656 1.32034C24.7552 1.79966 25 2.37585 25 3.04892V17.7343C25 18.4073 24.7552 18.9835 24.2656 19.4629C23.776 19.9422 23.1876 20.1819 22.5 20.1819H7.5ZM7.5 17.7343H22.5V3.04892H7.5V17.7343ZM2.49999 25.0769C1.81249 25.0769 1.22395 24.8373 0.73437 24.3579C0.244785 23.8786 0 23.3025 0 22.6293V6.72025C0 6.37352 0.11979 6.08287 0.35937 5.84831C0.59895 5.61376 0.89583 5.49648 1.24999 5.49648C1.60416 5.49648 1.90104 5.61376 2.14062 5.84831C2.3802 6.08287 2.49999 6.37352 2.49999 6.72025V22.6293H18.75C19.1041 22.6293 19.4011 22.7467 19.6407 22.9812C19.8802 23.2157 20.0001 23.5063 20.0001 23.8532C20.0001 24.1999 19.8802 24.4905 19.6407 24.7251C19.4011 24.9596 19.1041 25.0769 18.75 25.0769H2.49999Z");
    pathElement.setAttribute("fill", "#000000");
    


    svgElement.appendChild(pathElement);

    svgSpan.appendChild(svgElement);
    h5Element.appendChild(svgSpan);
    titleSpan.appendChild(document.createTextNode(divElement.innerText));
    h5Element.appendChild(titleSpan);

    const cardBodyElement = document.createElement('div');
    cardBodyElement.className = 'card-body d-flex align-items-center';
    cardBodyElement.appendChild(h5Element);

    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.appendChild(cardBodyElement);

    const colElement = document.createElement('div');
    colElement.className = 'col';
    colElement.appendChild(cardElement);

    if(landing__card !== null) {

      landing__card.appendChild(colElement);
    }


    colElement.addEventListener('click', function() {
      const cardTitleElement = this.querySelector('.card-title');

      if (cardTitleElement) {   
        menu__wrapper.classList.remove("hidecard") 
        mainCategoryFistTime.classList.add("hidecard")
        clickedIndex = index;
        updateBigCard();
        const firsTimeCategory = document.querySelector("#bigCardText .map")
        const nested = firsTimeCategory.querySelectorAll(".nested")
        nested.forEach((div) => {
          div.classList.add("tocActive")
        })
      }
    });
  });

  // Initial setup
  updateBigCard();


  const cardElement = document.createElement('ul');
  cardElement.className = 'map';

  cardElement.appendChild(colElement);
  if(bigCardText !== null){
    bigCardText.appendChild(cardElement);

  }

  const cardTextz = document.querySelector("#bigCardText");
  if(cardTextz !== null){
    const menuIcons = cardTextz.querySelector(".menu__icon");
    menuIcons.classList.add("Hidemenu__icon")
  }
  
});


document.addEventListener("DOMContentLoaded", () => {

  var acc = document.getElementsByClassName("LandingAccordion");
  var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("LandingActive");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
      } 
    });
  }
})



// ====================================================== Add Click Listener to the sidebar list
document.addEventListener("DOMContentLoaded", () => {
  var toggler = document.getElementsByClassName("caret");
  var i;
  
  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      
      this.parentElement.querySelector(".nested").classList.toggle("tocActive");
      this.classList.toggle("caret-down");
    });
  }
})



// ======================================================= Big Cards Landing Page -- Added dynamic title and url in the 4 cards
document.addEventListener("DOMContentLoaded", () => {
  const listItems = document.querySelectorAll("ul.map > li");

  const cardList = [];

  // If left sidebar has at least 4 moudles then execute below code
  if (listItems.length > 4) {
    for (let i = 0; i <= 3; i++) {
      if (listItems[i].querySelector("div.caret") !== null) {
        cardList.push({
          title: listItems[i].querySelector("div.caret").innerText.trim(),
          url: listItems[i].querySelector("a").href,
        });
      } else {
        cardList.push({
          title: listItems[i].querySelector("a").innerText.trim(),
          url: listItems[i].querySelector("a").href,
        });
      }
    }
  }

  const leftSmallCard = document.getElementById("leftSmallCard");
  const smallCards = leftSmallCard.querySelectorAll(".smallCard");
  const cardTitle = leftSmallCard.querySelectorAll(".smallCard .cardTitle");

  const mapp = document.querySelector(".map");
  const allLiElements = mapp.querySelectorAll("li");

  const liElements = Array.from(allLiElements).filter((liElement) => {
    return liElement.parentElement === mapp;
  });


  // If sidebar modules length less than 4 then redirect user to the first topic of the 1st module
  if (liElements.length < 4) {
    window.location.replace(liElements[0].querySelector("li  a").href);
  } else {
    const imgback = document.querySelector(".imgback");
    imgback.classList.remove("d-none");
    const landingPageCards = document.querySelector(".landingPageCards");
    landingPageCards.classList.remove("d-none");
    for (let i = 0; i < cardTitle.length; i++) {
      cardTitle[i].innerText = cardList[i].title;

      smallCards[i].addEventListener("click", () => {
        const clickUrl = cardList[i].url;

        window.location.href = clickUrl;
      });
    }
  }
});



// ============================================== Landing page Paragram -- dynamic text from 1st page of the 1st module
document.addEventListener("DOMContentLoaded", () => {
  const myUL = document.querySelector(".myUL > ul > li");
  let url = myUL.querySelector("a").href;
  const para1 = document.querySelector(".para1");
  const readmoreBtn = document.querySelector(".readmoreBtn");

  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(html, "text/html");

      const paragraphs = parsedHtml.querySelectorAll(".body > .p");
      let paragraphText = "";

      paragraphs.forEach((paragraph) => {
        paragraphText += paragraph.textContent + "\n";
      });
  
      // only showing 1000 character in the Landing Page Paragraph -- change 1000 with according to your need
      para1.innerText = paragraphText.substring(0, 1000) + "...";
      readmoreBtn.href = url
    })
    .catch((error) => {
      console.error("Error fetching the HTML:", error);
    });
});