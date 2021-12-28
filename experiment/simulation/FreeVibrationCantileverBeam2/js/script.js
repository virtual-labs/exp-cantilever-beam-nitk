        var time=0; //keeps track of the time of the animation
        var beamlength=1500; //Length of the beam inmm
        var simTimeId; //for animation function
        var pauseTime;//for running animation when simulation is paused
        var rho=7750; //Density in kg/m^3
        var A = 14.6E-4; //Area in m^2
        var massbeam=33/140*rho*A*beamlength/1000; //Mass of the beam=volume * density
        var E=200E9; //Young's Modulus
        var I=4.08E-7;//Ixx value
        var dampingratio=0;
        var endmass=25;
        var m=33/140*massbeam+endmass;
        var k=3*E*I/Math.pow(beamlength/1000,3); //Stiffness value for a cantilever beam
        var wn=Math.sqrt(k/m); //Natural Frequency
        var wd=wn*Math.sqrt(1-dampingratio*dampingratio); //Damped natural frequency
        var initdisp=500; //Initial displacement given to the beam
        var simstatus;
        function actdisplace(t){
            let value=Math.exp(-dampingratio*wn*t)*(initdisp*Math.cos(wd*t)+(dampingratio*wn*initdisp*Math.sin(wd*t)/wd));
            return value;
        } //Function to calculate the displacement
        var beaminf=[
            "ISMB 100\n h=100 mm,b=75 mm\n t1=4 mm,t2=7 mm\nIxx=257.5 cm^4\nIyy=40.8 cm^4\nA=14.6 cm^2",
            "ISNT 150\n h=150 mm,b=150 mm\n t1=10 mm,t2=10 mm\nIxx=541.1 cm^4\nIyy=250.3 cm^4\nA=28.88 cm^2",
            "ISMC 100\n h=100 mm,b=50 mm\n t1=4.7 mm,t2=7.5 mm\nIxx=186.7 cm^4\nIyy=25.9 cm^4\nA=11.7 cm^2",
            "ISA 100100\n h=100 mm,b=100 mm\n t=12 mm\nIxx=207 cm^4\nIyy=207 cm^4\nA=22.59 cm^2",
            "SQUARE\n h=150 mm,b=150 mm\n Ixx=4218.75 cm^4\nIyy=4218.75 cm^4\nA=225 cm^2",
            "CIRCLE\n D=150 mm\n Ixx=2485.05 cm^4\nIyy=2485.05 cm^4\nA=176.72 cm^2"
        ];//Standard beam dimensions
        //start of simulation here; starts the timer with increments of 0.01 seconds
        var disptime = 0;
        var dispdisp = actdisplace(disptime);
        var questionstate = 1;
        var secname = "I section";
        var matname =  "Steel";
        function startsim()
        {
            pauseTime=setInterval("varupdate();",'100');
            simstatus=1;

        }
        // switches state of simulation between 0:Playing & 1:Paused
        function simstate()
        {
            let imgfilename=document.getElementById('playpausebutton').src;
            imgfilename = imgfilename.substring(imgfilename.lastIndexOf('/') + 1, imgfilename.lastIndexOf('.'));
            if (imgfilename==="bluepausedull")
            {
                document.getElementById('playpausebutton').src="./images/blueplaydull.png";

                clearInterval(simTimeId);
                simstatus=1;
                pauseTime=setInterval("varupdate();",'100');
            }
            if (imgfilename==="blueplaydull")
            {
                document.getElementById('playpausebutton').src="./images/bluepausedull.png";
                simstatus=0;
                clearInterval(pauseTime);
                time=0;
                simTimeId=setInterval("varupdate();time+=.01;",10);

            }
        }
        //Initialise system parameters here
        function varinit()
        {
            let canvas=document.getElementById("graphscreen");
            canvas.style.visibility="hidden";
            endmass=25;
            beamlength=1500;
            dampingratio = 0.05;
            varchange();
            $( "#slidergraph" ).draggable({axis: "x",
            containment: "#constraintbox",
            drag:function(){printcordinates($("#slidergraph").position().left);},
            });
            document.addEventListener("touchstart", touchHandler, true);
            document.addEventListener("touchmove", touchHandler, true);
            document.addEventListener("touchend", touchHandler, true);
            document.addEventListener("touchcancel", touchHandler, true);
        }
        function varchange()
        {
            varupdate();

        }
        function varupdate()
        {
            massbeam=rho*A*beamlength/1000;
            m=33/140*massbeam+endmass;
            k=3*E*I/Math.pow(beamlength/1000,3);
            wn=Math.sqrt(k/(m));
            let cc=2*Math.sqrt(k*m);
            let c=dampingratio*cc;
            wd=wn*Math.sqrt(1-dampingratio*dampingratio);
            let mattext = document.getElementById("matname");
            mattext.innerHTML = matname;
            let sectext = document.getElementById("secname");
            sectext.innerHTML = secname;
           document.getElementById("massSystem").title="M ="+m.toFixed(4)+" kg"+"\n"+"c = "+c.toFixed(4)+" Ns/m"+"\n"+"k ="+(k/1000).toFixed(4)+" N/mm";
            //If simulation is running
           if(!simstatus)
            {
                //Disabling the slider,spinner and drop down menu
                

            }
            //If simulation is stopped
            if(simstatus)
            {
                //Enabling the slider,spinner and drop down menu
           

            }
            draw();
            plotgraph();

        }
        //Simulation graphics
        function draw() {

            let canvas = document.getElementById("simscreen");
            let ctx = canvas.getContext("2d");
            var ball = {
                xpos: beamlength/10 + 25,
                ypos: 210 + actdisplace(time)/10,
                size: endmass===0?0:15+endmass/5,
                draw: function () {
                    ctx.beginPath();
                    ctx.arc(ball.xpos, ball.ypos, ball.size, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'brown';
                    ctx.stroke();
                    ctx.fillStyle = "brown";
                    ctx.fill();
                }

            };

            function beamdef(y) {
                ctx.fillStyle = "blue";
                for (var i = 0; i <= beamlength/10 ; i++) {
                    ctx.fillRect(i + 25, y * i * i / 2 / (Math.pow(beamlength/10, 3)) * (3 * beamlength/10 - i) - 10 + 210, 1, 20)
                }


                ctx.beginPath();
                ctx.arc(ball.xpos+1, ball.ypos, 9.5, 3*Math.PI/2,Math.PI/2, false);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'blue';
                ctx.stroke();
                ctx.fill();
            }
            ctx.clearRect(0,0,550,400);
            beamdef(ball.ypos - 210);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 105, 25, 200)
            ball.draw();
        }
        //Graph plotting function
        function plotgraph(){
            let canvas=document.getElementById("graphscreen")
            let ctx= canvas.getContext("2d");

            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.font='15px Arial';
            ctx.save();
            ctx.translate(0,225);
            ctx.rotate(-Math.PI/2);
            ctx.fillText('Displacement',0,15);
            ctx.restore();
            ctx.fillText('Time',250,370);
            ctx.beginPath();

            ctx.moveTo(20,80);
            ctx.lineTo(20,330);
            ctx.moveTo(20,205)
            ctx.lineTo(320,205)
            ctx.moveTo(20,330);
            ctx.lineTo(320,330);
            ctx.strokeStyle="black";
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();


            ctx.moveTo(20,205);
            var i=0;
            ctx.strokeStyle="green";
            ctx.lineWidth=1;
            while(i<300){

               ctx.lineTo(i+20,205-0.9*actdisplace(.003*i)/5);
               ctx.moveTo(i+20,205-0.9*actdisplace(.003*i)/5);
               i+=.01;
           }
          ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle="black";
            ctx.moveTo(350,345);
            ctx.lineTo(350,135);
            ctx.moveTo(350,345);
            ctx.lineTo(550,345);
            ctx.stroke();
            ctx.save();
            ctx.translate(340,345);
            ctx.rotate(-Math.PI/2);
            ctx.fillText('Amplitude',30,0);
            ctx.restore();
            ctx.font='10px Arial';
            ctx.fillText('Frequency(rad/s)',470,355);
            ctx.strokeStyle="#800080";
            ctx.lineWidth=1;
            ctx.moveTo(350,345);
            function amplitude(n) {
                return 20/ Math.sqrt(Math.pow((1 - n * n), 2) + Math.pow((2 * 0.05* n), 2));
            }
            let j=0;
            ctx.beginPath();
            while(j<300){
                ctx.lineTo(j+370,325-0.9*amplitude(0.01*j));
                ctx.moveTo(j+370,325-0.9*amplitude(0.01*j));
                j+=.01;
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle="green";
            ctx.moveTo(470,360);
            ctx.lineTo(470,100);
            ctx.stroke();
            ctx.font='12px Arial';
            ctx.fillText("\u03C9d="+wd.toFixed(3)+"rad/s",430,370);
            ctx.font='16px Comic Sans MS';
            let dispstr = "Displacement: " + (dispdisp/5).toFixed(2) + " mm";
            let timestr = "Time: " + (disptime*1000).toFixed(2) + " ms"
            ctx.fillText(dispstr,10,370);
            ctx.fillText(timestr,10,390);
        }
        //Switches between graph screen and simulation screen
        function changescreen(){
            let startbtn = document.getElementById("startexpbtn");
            let restbtn = document.getElementById("restexpbtn");
            let playbtn = document.getElementById('playpausebutton');
            let graphscrn =document.getElementById("graphscreen");
            let beamimg = document.getElementById("beamimg");
            let simscrn = document.getElementById("simscreen");
            let crossimg = document.getElementById("crosssec");
            let graphslider = document.getElementById("slidergraph");
            let titleincanvas = document.getElementById("titleincanvas");
            let checkint = document.getElementById("checkint");
            let checkbtn = document.getElementById("checkbtn");
            let resultimg = document.getElementById("resultimg");
            let intvalue = document.getElementById("checkint");
            $("#slidergraph").css('left', 20);
            disptime = 0;
            dispdisp = actdisplace(disptime);
            simscrn.style.visibility="hidden";
            startbtn.style.visibility = "hidden";
            playbtn.style.visibility = "hidden";
            crossimg.style.visibility = "hidden";
            titleincanvas.style.visibility = "hidden";
            intvalue.value = "";
            resultimg.style.visibility = "hidden";
            restbtn.style.visibility = "visible";
            graphscrn.style.visibility="visible";
            beamimg.style.visibility = "visible";
            graphslider.style.visibility = "visible";
            checkint.style.visibility = "visible";
            checkbtn.style.visibility = "visible";
            randomize();
            let quest1 = `Find damping ratio(ζ) from logarthmic decrement(δ)`;
            let quest = document.getElementById("quest")
            quest.innerHTML = quest1;
        }
        function printcordinates(x){
            disptime = 0.9/295*(x-28);
            dispdisp = actdisplace(disptime) 
        }
        function checkans(){
            let intvalue = document.getElementById("checkint");
            let logdecr = (2*Math.PI*dampingratio)/(Math.sqrt(1-dampingratio*dampingratio));
            console.log(logdecr);
            let ans = parseFloat(intvalue.value)
            let resultimg = document.getElementById("resultimg");
            if(ans.toFixed(2) == parseFloat(dampingratio).toFixed(2)){
                resultimg.src = "./images/tick (2).png";
                resultimg.style.visibility = "visible";
                
            }
            else{
                resultimg.src = "./images/cross (2).png";
                resultimg.style.visibility = "visible";
            }
        }
        //Randomizes input variables
        function randomize(){
          let areano  =  Math.floor(Math.random() * 6);
          switch (areano) {
              //I section
            case 0:
            document.getElementById("crosssec").src="./images/crossI.PNG";
                document.getElementById("crosssec").title=beaminf[0];
                A=14.6E-4;
                I=257.5E-8;
                secname = "I section"
               break;

               //T section
            case 1:
                document.getElementById("crosssec").src="./images/crossT.PNG";
                document.getElementById("crosssec").title=beaminf[1];
                A=28.88E-4;
                I=541.1E-8;
                secname = "T section"
                break;

                //C section
            case 2:
               document.getElementById("crosssec").src="./images/crossC.PNG";
                document.getElementById("crosssec").title=beaminf[2];
                document.getElementById("text1").innerHTML ="";
                A=11.7E-4;
                I=186.7E-8;
                secname = "C section"
               break;

               //L section
            case 3:
               document.getElementById("crosssec").src="./images/crossL.PNG";
                document.getElementById("crosssec").title=beaminf[3];
                A=22.59E-4;
                I=207E-8;
                secname = "L section"
               break;

               //Sqr section
            case 4:
               document.getElementById("crosssec").src="./images/crossSqr.PNG";
                document.getElementById("crosssec").title=beaminf[4];
                A=225E-4;
                I=4218.75E-8;
                secname = "Square section"
               break;

               //Circular section
            case 5:
               document.getElementById("crosssec").src="./images/crossCirc.PNG";
                document.getElementById("crosssec").title=beaminf[5];
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
        endmass =  Math.floor(Math.random() * (200));
        dampingratio = (Math.random()*0.5).toFixed(2);
        let lengthtxt = document.getElementById("lengthtxt");
        lengthtxt.innerHTML = " " + beamlength;
    }
        function touchHandler(event) {
            var touch = event.changedTouches[0];
        
            var simulatedEvent = document.createEvent("MouseEvent");
                simulatedEvent.initMouseEvent({
                touchstart: "mousedown",
                touchmove: "mousemove",
                touchend: "mouseup"
            }[event.type], true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0, null);
        
            touch.target.dispatchEvent(simulatedEvent);
        }