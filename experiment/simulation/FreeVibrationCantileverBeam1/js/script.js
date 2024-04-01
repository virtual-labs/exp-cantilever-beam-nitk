
var beaminf=[
  "ISMB 100\n h=100 mm,b=75 mm\n t1=4 mm,t2=7 mm\nIxx=257.5 cm^4\nIyy=40.8 cm^4\nA=14.6 cm^2",
  "ISNT 150\n h=150 mm,b=150 mm\n t1=10 mm,t2=10 mm\nIxx=541.1 cm^4\nIyy=250.3 cm^4\nA=28.88 cm^2",
  "ISMC 100\n h=100 mm,b=50 mm\n t1=4.7 mm,t2=7.5 mm\nIxx=186.7 cm^4\nIyy=25.9 cm^4\nA=11.7 cm^2",
  "ISA 100100\n h=100 mm,b=100 mm\n t=12 mm\nIxx=207 cm^4\nIyy=207 cm^4\nA=22.59 cm^2",
  "SQUARE\n h=150 mm,b=150 mm\n Ixx=4218.75 cm^4\nIyy=4218.75 cm^4\nA=225 cm^2",
  "CIRCLE\n D=150 mm\n Ixx=2485.05 cm^4\nIyy=2485.05 cm^4\nA=176.72 cm^2"
];


// simulation variables
let time = 0; //keeps track of the time of the animation
let beamlength = 1500; //Length of the beam inmm
let simTimeId; //for animation function
let pauseTime; //for running animation when simulation is paused
let rho = 7750; //Density in kg/m^3
let A = 14.6E-4; //Area in m^2
var massbeam=33/140*rho*A*beamlength/1000; //Mass of the beam=volume * density
let E = 200E9; //Young's Modulus
let I = 4.08E-7; //Ixx value
let dampingratio = 0;
let endmass = 25;
let m = (33 / 140) * massbeam + endmass;
let k = (3 * E * I) / Math.pow(beamlength / 1000, 3); //Stiffness value for a cantilever beam
let wn = Math.sqrt(k / m); //Natural Frequency
console.log(wn);
let wd = wn * Math.sqrt(1 - dampingratio * dampingratio); //Damped natural frequency
let initdisp = 500; //Initial displacement given to the beam
let simstatus;
let offsetX = 20;

// var questionstate = 1;
var secname = "I section";
var matname =  "Steel";
// canvas variables
// graphics
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById('tooltip');


// graph1
const graphCanvas1 = document.querySelector("#graphscreen1");
const graphctx1 = graphCanvas1.getContext("2d");
const coordinatesElement = document.getElementById('coordinates');
//  graph2
const graphCanvas2 = document.querySelector("#graphscreen2");
const graphctx2 = graphCanvas2.getContext("2d");

// fix scaling of canavs as per media
let mediaQuery1 = window.matchMedia("screen and (max-width: 540px)");
let mediaQuery2 = window.matchMedia("screen and (max-width: 704px)");
let mediaQuery3 = window.matchMedia("screen and (max-width: 820px)");
let mediaQuery4 = window.matchMedia("screen and (max-width: 912px)");
let scaleX = 0.5;
let scaleY = 0.5;

// dom elements
const sectionImg = document.querySelector(".cross-img img");
const sectionTooltip = document.querySelector(".sec-tooltip");
const cirTooltip = document.querySelector(".cir-tooltip");
const cirTooltip1 = document.querySelector(".cir-tooltip1");
const materials = document.querySelector("#materials");
const sections = document.querySelector("#sections");
const otherSec = document.querySelector(".other-sec");



//Function to calculate the displacement


const actdisplace = function (t) {
  let value =
    Math.exp(-dampingratio * wn * t) *
    (initdisp * Math.cos(wd * t) +
      (dampingratio * wn * initdisp * Math.sin(wd * t)) / wd);
  return value;
};
var disptime = 0;
var dispdisp = actdisplace(disptime);
var xaxis;
console.log(dispdisp);

//start of simulation here; starts the timer with increments of 0.01 seconds
function startsim() {
  simTimeId = setInterval("varupdate();time+=.01;", 10);
}
// switches state of simulation between 0:Playing & 1:Paused
function simstate() {
  let imgfilename = document.getElementById("playpausebutton").src;
  imgfilename = imgfilename.substring(
    imgfilename.lastIndexOf("/") + 1,
    imgfilename.lastIndexOf(".")
  );
  if (imgfilename === "bluepausedull") {
    document.getElementById("playpausebutton").src =
      "./images/blueplaydull.svg";

    clearInterval(simTimeId);
    simstatus = 1;
    pauseTime = setInterval("varupdate();", "100");
    document.querySelector(".playPause").textContent = "Play";
  }
  if (imgfilename === "blueplaydull") {
    document.getElementById("playpausebutton").src =
      "./images/bluepausedull.svg";
    simstatus = 0;
    clearInterval(pauseTime);
    time = 0;
    simTimeId = setInterval("varupdate();time+=.01;", 10);
    document.querySelector(".playPause").textContent = "Pause";
  }
}


//Initialise system parameters here
function varinit() {
  endmass = 25;//Updating variables
  beamlength = 1500;
  dampingratio =0.05;
  varchange();

  $( "#slidergraph" ).draggable({axis: "x",
  containment: "#constraintbox",
  drag:function(){printcordinates($("#slidergraph").position().left);},
  });
  
 console.log(disptime);
 console.log(dispdisp);

 
}
function varchange() {
  varupdate();

}
function varupdate() {


  massbeam = (rho * A * beamlength) / 1000;
  m = (33 / 140) * massbeam + endmass;
  k = (3 * E * I) / Math.pow(beamlength / 1000, 3);
  wn = Math.sqrt(k / m);
  let cc = 2 * Math.sqrt(k * m);
  let c = dampingratio * cc;
  wd = wn * Math.sqrt(1 - dampingratio * dampingratio);

  
  document.getElementById("matname").innerHTML = matname;
  document.getElementById("secname").innerHTML = secname;
  document.getElementById("lengthtxt").innerHTML = beamlength;

  cirTooltip.innerHTML = `M = ${m.toFixed(4)} \n kg <br>  c = ${c.toFixed(
    4
  )}Ns/m \n <br> k = ${(k / 1000).toFixed(4)}N/mm
  `;
  cirTooltip1.innerHTML = 'Note: Hover on the graph to display the Displacement and Time';
 
  if (!simstatus) {
    //Disabling the slider,spinner and drop down menu

  }
  //If simulation is stopped
  if (simstatus) {
    //Enabling the slider,spinner and drop down menu

  }
  draw();
  generateGraph();
}

const setMediaQueries = function (ctx) {
  let originalX = 20;
  if (mediaQuery1.matches) {
    scaleX = 1.5;
    // originalX = 20;
    originalX = canvas.width / 4 - 10;
    scaleY = 0.6;
  } else if (mediaQuery2.matches) {
    scaleX = 1;
    // originalX = canvas.width / 4 - 10;
    scaleY = 0.6;
  } else if (mediaQuery3.matches) {
    scaleX = 1;
    originalX = canvas.width / 4 - 10;
    scaleY = 0.4;
  } else if (mediaQuery4.matches) {
    scaleX = 1;
    originalX = canvas.width / 4 - 10;
    scaleY = 0.4;
  } else {
    // originalX = canvas.width / 4 - 20;
    scaleX = 0.3;
    scaleY = 0.5;
  }
  ctx.canvas.width = document.documentElement.clientWidth * scaleX;
  ctx.canvas.height = document.documentElement.clientHeight * scaleY;
  return originalX;
};

const draw = function () {
  let originalX = setMediaQueries(ctx);
  ctx.canvas.width = document.documentElement.clientWidth * scaleX;
  ctx.canvas.height = document.documentElement.clientHeight * scaleY;
  let ball = {
    xpos: beamlength / 10 + originalX + 25,
    ypos: 210 + actdisplace(time) / 10,
    size: endmass === 0 ? 0 : 15 + endmass / 5,
    draw: function () {
      ctx.beginPath();
      ctx.arc(ball.xpos, ball.ypos, ball.size, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "brown";
      ctx.stroke();
      ctx.fillStyle = "brown";
      ctx.fill();
    },
  };

  function beamdef(y) {
    ctx.fillStyle = "blue";
    for (let i = 0; i <= beamlength / 10; i++) {
      ctx.fillRect(
        i + originalX + 25,
        ((y * i * i) / 2 / Math.pow(beamlength / 10, 3)) *
          ((3 * beamlength) / 10 - i) -
          10 +
          210,
        1,
        20
      );
    }

    ctx.beginPath();
    ctx.arc(
      ball.xpos + 1,
      ball.ypos,
      9.5,
      (3 * Math.PI) / 2,
      Math.PI / 2,
      false
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.fill();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  beamdef(ball.ypos - 210);
  ctx.fillStyle = "black";
  ctx.fillRect(originalX, 105, 25, 200);
  ball.draw();
  generateGraph();
};

function generateGraph( x, y) {
  // Graph 1


  let graph1X = setMediaQueries(graphctx1);
  graphctx1.canvas.width = document.documentElement.clientWidth * scaleX;
  graphctx1.canvas.height = document.documentElement.clientHeight * scaleY;
  graphctx1.clearRect(0, 0, graphCanvas1.width, graphCanvas1.height);


  graphctx1.font = "2rem Comic sans MS";
  graphctx1.save();
  graphctx1.translate(0, 225);
  graphctx1.rotate(-Math.PI / 2);
  graphctx1.fillText("Displacement", -50, 15);
  graphctx1.restore();
  graphctx1.fillText("Time", 150, 350);
  graphctx1.beginPath();

  graphctx1.moveTo(20, 100);
  graphctx1.lineTo(20, 350);
  graphctx1.moveTo(20, 225);
  graphctx1.lineTo(graphCanvas1.width, 225);
  graphctx1.moveTo(20,350)
  graphctx1.lineTo(graphCanvas1.width, 350);

  graphctx1.strokeStyle = "black";
  graphctx1.stroke();
  graphctx1.closePath();

  graphctx1.beginPath();
  graphctx1.moveTo(20, 225);
  let i = 0;
  graphctx1.strokeStyle = "green";
  graphctx1.lineWidth = 1;
  while (i < graphCanvas1.width ) {
    graphctx1.lineTo(i + 20, 225 - (0.9 * actdisplace(0.003 * i)) / 5);
    graphctx1.moveTo(i + 20, 225 - (0.9 * actdisplace(0.003 * i)) / 5);
    i += 0.01;
  }
  graphctx1.stroke();
 
  graphctx1.font='12px Nunit';

          
            graphctx1.font='16px Comic Sans MS';
            let dispstr = "Displacement: " + (dispdisp/5).toFixed(2) + " mm";
          
            let timestr = "Time: " + (disptime*1000).toFixed(2) + " ms";
          
            graphctx1.fillText(dispstr,10,370);
            graphctx1.fillText(timestr,240,370);

       
  // Graph 2
  let graph2X = setMediaQueries(graphctx2);
  graphctx2.canvas.width = document.documentElement.clientWidth * scaleX;
  graphctx2.canvas.height = document.documentElement.clientHeight * scaleY;
  graphctx2.clearRect(0, 0, graphCanvas2.width, graphCanvas2.height);
  graphctx2.font = "2rem Comic sans MS";
  graphctx2.beginPath();
  graphctx2.strokeStyle = "black";
  graphctx2.moveTo(20, 330);
  graphctx2.lineTo(20, 135);
  graphctx2.moveTo(20, 330);
  graphctx2.lineTo(520, 330);
  graphctx2.stroke();
  graphctx2.save();
  graphctx2.translate(10, 345);
  graphctx2.rotate(-Math.PI / 2);
  graphctx2.fillText("Amplitude", 45, 5);
  graphctx2.restore();
  graphctx2.fillText("Frequency(rad/s)", 170, 350);
  graphctx2.strokeStyle = "#800080";
  graphctx2.lineWidth = 1;
  graphctx2.moveTo(350, 345);
  function amplitude(n) {
    return 20 / Math.sqrt(Math.pow(1 - n * n, 2) + Math.pow(2 * 0.05 * n, 2));
  }
  let j = 0;
  graphctx2.beginPath();
  while (j < 300) {
    graphctx2.lineTo(j + 50, 325 - 0.9 * amplitude(0.01 * j));
    graphctx2.moveTo(j + 50, 325 - 0.9 * amplitude(0.01 * j));
    j += 0.01;
  }
  graphctx2.stroke();
  graphctx2.beginPath();
  graphctx2.strokeStyle = "green";
  graphctx2.moveTo(150, 360);
  graphctx2.lineTo(150, 100);
  graphctx2.stroke();
  graphctx2.font = "2rem Comic sans MS";
  graphctx2.fillText("\u03C9d= " + wd.toFixed(3) + "rad/s", 260, 300);

  graphctx1.beginPath();
  graphctx1.strokeStyle= "black";
  graphctx1.moveTo(x, y);
  graphctx1.lineTo(x , y + 70);
  graphctx1.stroke();

}
 // Function to get mouse coordinates relative to the canvas
 function getCoordinates(event) {
  const rect = graphCanvas1.getBoundingClientRect();
  const clientX = event.clientX - offsetX|| (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return { x, y };
}
function handleMove(event) {
  const { x, y } = getCoordinates(event);

 
  var xaxis =  ` ${x.toFixed(2)}`;

  disptime = 0.9/295*(xaxis-28);
  dispdisp = actdisplace(disptime) 
 


  
}
function handleKeyPress(event) {
  // Check if the pressed key is "Enter"
  if (event.key === 'Enter') {
      // Perform your desired action here
      checkans();
  }
}

function handleEnd() {
  tooltip.style.display = 'none';
}

graphCanvas1.addEventListener('mousemove', handleMove);
graphCanvas1.addEventListener('touchmove', handleMove);
graphCanvas1.addEventListener('mouseout', handleEnd);
graphCanvas1.addEventListener('touchend', handleEnd);
 function toggleImg(){

  var cross = document.getElementById("cross");
  cross.style.display = (cross.style.display === "none") ? "block" : "none";

  var beam = document.getElementById("beam");
  beam.style.display = (beam.style.display === "none") ? "block" : "none";

  document.getElementById("checkint").value="";
  document.getElementById("checksapn").innerHTML="";
 
  var nextbutton = document.getElementById("screenchangesforward");
  nextbutton.style.display = (nextbutton.style.display === "none") ? "block" : "none";

  var restart = document.getElementById("restart1");
  restart.style.display = (restart.style.display === "none") ? "block" : "none";
 
  


}
$("#graphbutton").click(function () {
  console.log("clicked");
});
function checkans(){
  let intvalue = document.getElementById("checkint");
  let logdecr = (2*Math.PI*dampingratio)/(Math.sqrt(1-dampingratio*dampingratio));
  console.log(logdecr);
  let ans = parseFloat(intvalue.value)
  // let resultimg = document.getElementById("checksapn");
  if(ans.toFixed(1)==logdecr.toFixed(1)){
    document.getElementById("checksapn").innerHTML = "<span style='color:green'>&#10004;</span>";
      
  }
  else{
    document.getElementById("checksapn").innerHTML = "<span style='color:red'>&#10008;</span>";
  }
}
function plotgraph() {
  endmass = 25;//Updating variables
  beamlength = 1500;
  dampingratio =0.05;
   secname = "I section";
   matname =  "Steel";
  const graphDiv = document.querySelectorAll(".graph-div");

  graphDiv.forEach((graph) => {
    graph.classList.toggle("display-hide");
   
  });
  generateGraph();
  graphDiv[0].scrollIntoView({
    behavior: "smooth",
  });
}
function changescreen1(){
  const canvasDiv= document.querySelectorAll(".canvas__div");

  canvasDiv.forEach((canvas) => {
    canvas.classList.toggle("display-hide");
    
  })
  draw();

  
}
function printcordinates(x,xaxisValue){

  console.log(xaxisValue  );
  disptime = 0.9/295*(x-28);
  dispdisp = actdisplace(disptime) 


}

  

window.addEventListener("load", varinit);

const selectSection = function () {
  otherSec.classList.remove("display-flex");
  otherSec.classList.add("display-hide");
  let value = sections.value;
  if (value != 6) {
    sectionImg.src = beamInfo[value].path;
    const infos = Object.entries(beamInfo[value]);
    sectionTooltip.innerHTML = "";
    for (const [key, value] of infos.slice(0, -3)) {
      const text = `${key}:${value}, `;
      sectionTooltip.insertAdjacentHTML("beforeend", text);
    }
    for (const [key, value] of infos) {
      if (key == "A") {
        A = value;
      }
      if (key == "I") {
        I = value;
      }
    }
    varupdate();
  } else {
    otherSec.classList.add("display-flex");
    otherSec.classList.remove("display-hide");
    sectionImg.src = "images/crossOth.PNG";
    A = 0.01;
    I = 0.01;
    sectionTooltip.innerHTML = "";
    sectionTooltip.innerHTML = `Area = ${A} m<sup>2</sup>, I = ${I} m<sup>4</sup>`;
    $("#CsArea").spinner({
      spin: function (event, ui) {
        A = ui.value;
        I = $("#Ivalue").spinner("value");
        sectionTooltip.innerHTML = `Area = ${A} m<sup>2</sup>, I = ${I} m<sup>4</sup>`;
      },
    });
    $("#Ivalue").spinner({
      spin: function (event, ui) {
        I = ui.value;
        A = $("#CsArea").spinner("value");
        sectionTooltip.innerHTML = `Area = ${A} m<sup>2</sup>, I = ${I} m<sup>4</sup>`;
      },
    });
  }
};
function randomize(){
  disptime = 0;
  dispdisp = 500;
  document.getElementById("checkint").value="";
  document.getElementById("checksapn").innerHTML="";
  let areano  =  Math.floor(Math.random() * 6);
  switch (areano) {
      //I section
    case 0:

        A=14.6E-4;
        I=257.5E-8;
        secname = "I section"
       
       break;

       //T section
    case 1:
      
        A=28.88E-4;
        I=541.1E-8;
        secname = "T section"
        break;

        //C section
    case 2:
     
        A=11.7E-4;
        I=186.7E-8;
        secname = "C section"
       break;

       //L section
    case 3:
    
        A=22.59E-4;
        I=207E-8;
        secname = "L section"
       break;

       //Sqr section
    case 4:
  
        A=225E-4;
        I=4218.75E-8;
        secname = "Square section"
       break;

       //Circular section
    case 5:
      
        A=176.72E-4;
        I=2485.05E-8;
        secname = "Circular section"
       break;  
 }
let matno = Math.floor(Math.random() * 3)
switch (matno){
   //Steel
case 0:
    E=200E9;
    rho=7750;
    matname = "Steel";
    break;
    //Aluminium
case 1:
    E=70.33E9;
    rho=2712;
    matname = "Aluminium";
    break;
    //Bronze
case 2:
    E=111.006E9;
    rho=8304;
    matname = "Bronze";
    break;

}
beamlength =  Math.floor(Math.random() * (2001)) + 1000;
console.log(beamlength);
endmass =  Math.floor(Math.random() * (200));
dampingratio = (Math.random()*0.5).toFixed(2);

}

const selectMaterial = function () {
  let value = materials.value;
  const infos = Object.entries(matInfo[value]);
  cirTooltip.innerHTML = "";
  for (const [key, value] of infos) {
    const text = `${key}:${value}, `;
    if (key == "E") {
      E = +value;
    }
    if (key == "rho") {
      rho = +value;
    }
    cirTooltip.insertAdjacentHTML("beforeend", text);
  }
  varupdate();
};

