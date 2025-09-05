
/* SmtpJS.com - v3.0.0 */
var Email = { send: function (a) { return new Promise(function (n, e) { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) }) }) }, ajaxPost: function (e, n, t) { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: function (e, n) { var t = Email.createCORSRequest("GET", e); t.onload = function () { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: function (e, n) { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };




// ======================================================== Add actvieBG class to the current opened Accordion/sidebar menu item
document.addEventListener("DOMContentLoaded", () => {
  const allATags = document.getElementById("sidebar_menulist");
  const ListOFaTags = allATags.querySelectorAll("a");
  let currenthref = window.location.href;

  currenthref = currenthref.split("#")[0]

  ListOFaTags.forEach((atag) => {
    
    if (atag.href === currenthref) {
      
      let parentElement = atag;


      parentElement = parentElement.parentElement;

      parentElement.classList.add("activeBG")
    }
  })
})


document.addEventListener("DOMContentLoaded", function() {
  var sidebar = document.querySelector(".bs-sidebar");
  sidebar.style.height = "calc(100vh - 57px) !important";
});

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelectorAll("footer")[1]
  footer.classList.add("d-none")
})

// ============================================================= Scroll Down Button
document.addEventListener("DOMContentLoaded", () => {
  const scrollButtonDown = document.getElementById('scrollButtonDown');
        
  scrollButtonDown.addEventListener('click', () => {         
    window.scrollTo(0, document.body.scrollHeight);
  });
   
  if(document.body.scrollHeight > 1500){
    window.addEventListener('scroll', () => {
      const distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
      
      if (window.scrollY <= 0 || distanceToBottom <= 0) {
        scrollButtonDown.style.display = 'none';
      } else {
        scrollButtonDown.style.display = 'block';
      }
    });
  }
});


// ============================================================= Scroll Up Button
document.addEventListener("DOMContentLoaded", () => {
  const scrollButtonUp = document.getElementById('scrollButtonUp');
        
        scrollButtonUp.addEventListener('click', () => {
            window.scrollTo({
              top: 0,
              behavior: "smooth"
          });
        });

        if(document.body.scrollHeight > 1500){
          window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            
            if (scrollY + clientHeight >= scrollHeight - 100) {
              scrollButtonUp.style.display = 'block';
            } else {
              scrollButtonUp.style.display = 'none';
            }
          });
        }
})



// ========================================== Removing 'note', 'alert', 'alert-info' these classes and adding bigNote class dynamically
document.addEventListener("DOMContentLoaded", () => {

  const elementToModify = document.querySelector('.body.taskbody');
  

  if(elementToModify !== null){
    const noteElements = elementToModify.querySelectorAll(".note.alert.alert-info");
  
  if (noteElements.length > 0) {
    
    noteElements.forEach(element => {
      
      element.classList.remove('note', 'alert', 'alert-info');
      
      element.classList.add('bigNote');
    });
  }
  }
})


// =========================================== set active class -- Content page left sidebar
window.addEventListener("load", () => {
  const activeUrl = getActiveUrl();
  const ulElement = document.querySelector("#bs-sidebar-nav");
  const nestedATags = getNestedATags(ulElement);
  nestedATags.forEach((aTag) => {
    const Url = aTag.href.split("/").pop();

    if (Url == activeUrl) {
      aTag.style.color = "#000";
    }
  });
});

const getActiveUrl = () => {
  const url = window.location.href.split("/").pop();
  return url;
};

function getNestedATags(element) {
  const nestedATags = [];

  function traverse(element) {
    if (element.tagName === "A") {
      nestedATags.push(element);
    } else {
      const children = element.children;
      for (const child of children) {
        traverse(child);
      }
    }
  }

  traverse(element);
  return nestedATags;
}

// ============================================ Mini TOC -- Right side bar
window.addEventListener("load", () => {
  const mainDiv = document.getElementsByClassName("bs-content")[0];
  const allTags = getTagsForTOC(mainDiv);
  if (allTags.length > 1) {
       addLastChildOfMain(allTags);
     }
});


// ========================================= Generate Unique ID 
function generateUniqueId() {
  const timestamp = new Date().getTime(); // Get current timestamp
  const random = Math.floor(Math.random() * 10000); // Generate a random number
  
  // Combine timestamp and random number to create a unique ID
  const uniqueId = `${timestamp}-${random}`;
  
  return uniqueId;
}


// ========================================== Getting Tags for MiniTOC 
function getTagsForTOC(element) {
  const nestedATags = [];
  function traverse(element) {
    if (
      element.tagName === "H1" ||
      element.tagName === "H2" ||
      element.tagName === "H3"
    ) {
      if (element.id) {
        element.style.scrollMarginBlockStart = " 80px";
        nestedATags.push(element);
      } else {
        const parentDiv = element.parentNode;
        parentDiv.style.scrollMarginBlockStart = " 80px";

        if(parentDiv.id !== "") {
          element.id = parentDiv.id;
        }
        else if(parentDiv.id === ""){
          let tagText = element.innerText.replaceAll(" ", "_")
          const id = generateUniqueId();
          element.id = tagText + id ;
        }
        nestedATags.push(element);
      }
    } else {
      const children = element.children;
      for (const child of children) {
        traverse(child);
      }
    }
  }

  traverse(element);
  return nestedATags;
}

const addLastChildOfMain = (allTags) => {
  let innerText = `
        <div class="bs-scrollspy mt-3 mb-5 mb-lg-5  text-body-secondary ignore-this">
        <div id="miniTOC" class="ps-3 pe-3 pe-xl-5">
        <span class="onThisTopic">ON THIS PAGE</span>
        <nav>
        <div data-spy="scroll" data-target="#navbar-example3" data-offset="0" id="scrollTagDiv">
        `;

  for (const tag of allTags) {
    innerText += `<a id="${tag.id}"  href="#${tag.id}" relationtag=${tag.tagName} onclick='setActiveClassOnClick(this)' >${tag.innerText}</a>`; 
  }

  innerText += `
     </div>
     </nav>
     </div>
     </div>
        `;

  const mainDiv = document.getElementsByClassName("bs-main")[0];
  mainDiv.insertAdjacentHTML("beforeend", innerText);
};


const getScrollTagEle = () => {
  const scrollDiv = document.getElementById("scrollTagDiv");
  if(scrollDiv){
    return scrollDiv.children;
  }
  return [];
};

const addActiveClassOnScroll = () => {
  const mainDiv = document.getElementsByClassName("bs-content")[0];
  const allTags = getTagsForTOC(mainDiv);
  const scrollTags = getScrollTagEle();

  for (const tag of allTags) {
    const topHeight = tag.getBoundingClientRect().top;
    if (0 < topHeight && topHeight < 200) {
      for (const child of scrollTags) {

        if (child.innerText == tag.innerText) {

          for (const prevChild of scrollTags) {
            prevChild.classList.remove("active");
          }
          child.classList.add("active");
        }
      }
    }
  }
};

window.addEventListener("scroll", addActiveClassOnScroll);
window.addEventListener("load", addActiveClassOnScroll);

function setActiveClassOnClick(e) {
  const scrollTags = getScrollTagEle();

  setTimeout(() => {
    for (const prevChild of scrollTags) {
      prevChild.classList.remove("active");
    }
    e.classList.add("active");
  },300);
}


  // =============================================================== Comment/Feedback form validation 

  (function () {
    'use strict';
  
    const forms = document.querySelectorAll('.requires-validation');
    const comment__form = document.querySelector("#comment__form");
    const commentForm = document.querySelector(".commentForm");
    const thankYou = document.querySelector(".thankYou");
  
    function sendEmailWithLoader(formElements, event) {

      const submitButton = formElements.submit;
      submitButton.innerHTML = '<div class="spinner-border text-light" role="status"></div> Sending...';
 
      event.preventDefault();
      event.stopPropagation();
  
      setTimeout(function () {
        submitButton.innerHTML = 'Submit';
        sendEmail(comment__form.elements, event);
        commentForm.classList.remove("displayForm")
        thankYou.style.display = 'block';
        
      
      }, 2000); 
    }
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          sendEmailWithLoader(comment__form.elements, event);
        }
  
        form.classList.add('was-validated');
      }, false);
    });
  })();
  
  
  

// ================================================== Comment Box Hide show
  document.addEventListener("DOMContentLoaded", () => {
    const reviewButtons = document.querySelectorAll(".reviewBtn");
    const commentForm = document.querySelector(".commentForm");
    const comment__form = document.querySelector("#comment__form");
    const likeBtn = document.querySelector("#likeBtn");
    const dislikeBtn = document.querySelector("#dislikeBtn");
    const thankYou = document.querySelector(".thankYou");
    const emailField = document.querySelector("#EMAIL");
    const commentField = document.querySelector("#DESCRIPTION");
   


    reviewButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        emailField.value = ""
        commentField.value = ""
        const review = btn.name;
       
        if(review === "Liked") {
          likeBtn.classList.add("liked")
          dislikeBtn.classList.remove("disliked")
          thankYou.style.display = 'none';
        }
        else if(review === "Disliked") {
          dislikeBtn.classList.add("disliked")+
          likeBtn.classList.remove("liked")
          thankYou.style.display = 'none';
        }
        const currentPageUrl = window.location.href;

        if (commentForm) {
          commentForm.classList.add("displayForm");
          const scrollOffset = 100; 
          window.scrollBy({
            top: commentForm.getBoundingClientRect().top - scrollOffset,
            behavior: "smooth",
          })
          for (const ele of comment__form.elements) {
              if (ele.name === "REVIEW") {
                ele.value = review;
              }
              else if (ele.name === "POST_URL") {
                ele.value = currentPageUrl;
              }
            }

            // let submitBtn = document.querySelector("#handleSubmit")
            // submitBtn.addEventListener("click" , () => {
            //   sendEmail(comment__form.elements)
            // })

        } else {
          console.error("commentForm not found.");
        }
      })
    })
  });

  
//   function sendEmail(ele, event) {
//     event.preventDefault();

//     let emailsList = ["gurushesh.p@metapercept.com"]

//     const isCc = ()=>{
//       let checkBoxCC = document.getElementById("checkBoxCC");
//       if (checkBoxCC.checked) {
//         emailsList.push("example@gmail.com", "abc@abc.com", "xyc@gmail.com")
//       }else{
//         emailsList = ["gurushesh.p@metapercept.com"]
//       }
//     }

//     isCc();


//     Email.send({
//       Host : "smtp.elasticemail.com",
//       Username : "gurushesh.p@metapercept.com",
//       Password : "A45F7607648D21089CDB439D89039DF77AB7",
//       To : emailsList,
//       From : `gurushesh.p@metapercept.com`,
//       Subject : "User Feedback",
//       Body : `User has submitted feedback for the following post <a href="${ele.POST_URL.value}"><b>Link</b></a> <br/>
//       <b>Email:</b> ${ele.email.value} <br/>
//       <b>User Reaction</b>: ${ele.REVIEW.value} <br/>
//       <b>Comment</b>: ${ele.DESCRIPTION.value}
//       `
//   }).then(
//     message => console.log(message)
//   );

//   return console.warn("Feedback submitted..")
// }


// ====================================================== Comment/Feedback form button button handler 
function sendEmail(ele, event) {
  event.preventDefault();

  Email.send({
    Host : "smtp.elasticemail.com",
    Username : "",
    Password : "",
    To : "",
    From : ``,
    Subject : "User Feedback",
    Body : `User has submitted feedback for the following post <a href="${ele.POST_URL.value}"><b>Link</b></a> <br/>
    <b>Email:</b> ${ele.email.value} <br/>
    <b>User Reaction</b>: ${ele.REVIEW.value} <br/>
    <b>Comment</b>: ${ele.DESCRIPTION.value}
    `
}).then(
  message => console.log(message)
);

return console.warn("Feedback submitted..")
}



// ========================================================== Next and Previous Button Landler 

document.addEventListener("DOMContentLoaded", () => {
  const previousBtn = document.getElementById("previousBtn");
  const nextBtn = document.getElementById("nextBtn");

  const allATags = document.getElementById("bs-sidebar-nav");

  console.log(allATags)
  const aTagsList = allATags.querySelectorAll("a");
  let currenthref = window.location.href;

  currenthref = currenthref.split("#")[0].split("?")[0];

  let previousSibling = null;
  let nextSibling = null;

  aTagsList.forEach((aTag, index) => {
    if (aTag.href === currenthref) {
      matchedTag = aTag;
      previousSibling = index > 0 ? aTagsList[index - 1] : null;
      nextSibling = index < aTagsList.length - 1 ? aTagsList[index + 1] : null;
    }
  });

  if (previousSibling) {
    const title = previousSibling.innerText;

    const dot = title.length > 30 ? "..." : "";
    previousBtn.innerHTML = `
    <a href="${previousSibling.href}" class="previous d-flex">
      <div class="arrowIcon me-3 d-flex justify-content-center align-items-center">
        <div class="d-flex justify-content-center align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
  <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
</svg>
        </div>
      </div>
      <div class="btnText d-flex flex-column justify-content-center">
        <span>PREVIOUS</span>
        <span class="d-none d-lg-block">${title.slice(0, 30)}${dot}</span>
        
      </div>
  </a> 
    `;
  }
  if (nextSibling) {
    const title = nextSibling.innerText;

    const dot = title.length > 30 ? "..." : "";

    nextBtn.innerHTML = `
      <a href="${nextSibling.href}" class="next d-flex">   
          <div class="btnText d-flex flex-column align-items-end  justify-content-center text-end ">
            <span>NEXT</span>
            <span class="d-none d-lg-block">${title.slice(0, 30)}${dot}</span>
          </div>
          <div class="arrowIcon ms-3 d-flex justify-content-center align-items-center">
            <div class="d-flex justify-content-center align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
  <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
</svg>
            </div>
          </div>
      </a>
        `;
  }
});



// ====================================================== Function for Showing MINI TOC only when user scroll down 
document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {
    const miniTOC = document.getElementById('miniTOC');

    if(miniTOC !== null){
        window.addEventListener('scroll', () => {
          if (window.scrollY >= 30) {
              miniTOC.style.display = 'block';
          } 
          // else {
          //     miniTOC.style.display = 'none';
          // }
      });
    }
  }, 500)
        
})


// =========================================================== Adding Dynamic class to the bigNote element
document.addEventListener("DOMContentLoaded", () => {
  let itemgroupInfoList = document.querySelectorAll('.itemgroup.info');

  itemgroupInfoList.forEach(itemgroupInfo => {
    if (itemgroupInfo.querySelector('.bigNote')) {
      itemgroupInfo.classList.add("displayBlogImportant")
    }
  });
});






// ================================================================== Module wise pdf download

document.addEventListener("DOMContentLoaded", () => {
  const sidebar_menulist = document.querySelector("#sidebar_menulist");
  const menuList = document.querySelectorAll("#sidebar_menulist > li");

  // add id to each outer li
  // menuList.forEach((li) => {
  //   const topicName = li.querySelector("div > div > span").innerHTML;

  //   li.id = topicName.trim().replaceAll(" ", "_");
  // });

  menuList.forEach((li) => {
    if (li.children.length !== 0) {
      if (li.querySelector("div > div > span") !== null) {
        const topicName = li.querySelector("div > div > span").innerHTML;
        li.id = topicName.trim().replaceAll(" ", "_");
      } else if (li.querySelector("div > div > span") === null) {
        const topicName = li.querySelector("div > div > a").innerHTML;
        li.id = topicName.trim().replaceAll(" ", "_");
      }
    }
  });
  sidebar_menulist.querySelectorAll("a").forEach((aa) => {
    if (aa.pathname === window.location.pathname) {
      const parentLiElements = findParentLiElements(aa);

      const liWithId = parentLiElements.filter((li) => li.id);

      // set pdf download path
      if (liWithId[0].id) {
        const dwnlAndLoader = document.querySelector("#dwnlAndLoader");
        const currentPath = dwnlAndLoader.getAttribute("href").split("/");
        currentPath.pop();
        currentPath.push(`${liWithId[0].id}.pdf`);

        const newPath = currentPath.join("/");

        dwnlAndLoader.href = newPath;
        dwnlAndLoader.download = liWithId[0].id;
      }
    }
  });

  // get parent li tag
  function findParentLiElements(element) {
    const parents = [];
    let currentElement = element.parentElement;

    while (currentElement) {
      if (currentElement.tagName === "LI") {
        parents.push(currentElement);
      }
      currentElement = currentElement.parentElement;
    }

    return parents;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.pathname ===
    "/aurigo_engage/getting_started/managing_your_plan"
  ) {
    const image = document.querySelector(".image");
    image.style.maxWidth = "100%";
  }
});
