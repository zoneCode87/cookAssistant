let chat = []
let AiMass = "";


document.getElementById('send').addEventListener('click', function () {
     const message = document.getElementById("user-text").value
     if(message.trim().length>0){
         CreatBoxUserMasseg();
         sendMessage(message).then((r)=> AiMass = r);

     }
});


async function sendMessage(message) {
    CreatBoxAIMasseg("")
    if(AiMass!=""){
        chat.push({role:"assistant",content:`${AiMass}`})
        chat.push({role:"user",content:`${message}`})
    }else{
        chat.push({role:"user",content:`${message}`})
    }
    const response = await fetch("/api/masseg/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({Data:chat}),
    });
    console.log(response.body);
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const boxmasseg = document.getElementById("AImassg")
    let result = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        result += chunk;
        boxmasseg.textContent = boxmasseg.textContent+chunk;
        boxmasseg.scrollIntoView({ behavior: "smooth" });
    }
    boxmasseg.innerHTML=boxmasseg.innerHTML +'<span class=\"sender\">AI</span>'
    boxmasseg.scrollIntoView({ behavior: "smooth" });
    boxmasseg.id="x";
    console.log(result)
    return result;
}



function CreatBoxAIMasseg(massg){
    const chatBox = document.querySelector('.chat-box');
    const message = document.createElement('div');
    message.className = 'box-masseg';
    message.innerHTML = `
    <span class="icon">
      <i class="fa-solid fa-utensils"></i>
    </span>
    <pre  class="textSender" id="AImassg">
       ${massg}
    </pre>
  `;
    chatBox.appendChild(message);
}


function CreatBoxUserMasseg() {
    const chatBox = document.querySelector('.chat-box');
    const message = document.createElement('div');
    const text = document.querySelector("textarea");

    message.className = 'box-masseg';
    message.innerHTML = `
    <span class="icon">
      <i class="fa-solid fa-user"></i>
    </span>
    <div class="textSender">
      ${text.value} 
      <br>
      <span class="sender">User</span>
    </div>
  `;
    message.scrollIntoView({ behavior: "smooth" });
    chatBox.appendChild(message);
    // Scroll to bottom
    text.value = "";
}
