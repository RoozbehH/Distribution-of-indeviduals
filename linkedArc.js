//Javascript Document
var dim; //the size of dimention of problem...
var doc; //Document size
var minObj=[],maxObj=[]; //min and max of Objectives
var intervals=[]; // The function who calculates and map the values on the arcs
var Data=[];
var selectingPoints=[];//for frame of selection
var sRect;//rectangle of selection
var linksCoord=[];//This array save the ID, start point and end point of each link
var selectedLinks=[];//This aray save the selected link wich are selected by selection frame.
var objNo,min,max;
var Angles=[];
var arcs=[],arcsG1=[],arcsG2=[],arcsG3=[],arcsG4=[],arcsG=[];
var maxTeta;//Hyperdiagonal between the objectives
var maxNorm=0;
var X,Y;//Center of arcs
var inR;//The internal radius of Arcs
var mode;
var tempPath=[];
var lineData=[];
var angelPos=[];
var finalPos=[];//based on the distance or norm
var rawData=[];
var colors=['#467d2b','#852722','#ff40e2','#1713ff','#2f9993','#ff1100','#9783a6','#ffea00','#455bdd','#8503ff','#11ffff'];
function execTool(a)//execute the app
{
    mode=a;

    fileName=files[0];
    var q=d3.queue();
    for(i=0;i<files.length;i++)
    {
        fileName = files[i];
        q.defer(d3.csv, fileName);

    }

    q.await(function (error) {
        if(!error)
        {
            //rawData=arguments;

            for(z=1;z<arguments.length;z++)
            {
                data = arguments[z];
                Data=CartToPolar(data);
                //for (i = 0; i < data.length; i++) {
                //    Data[i] = [+data[i].Norm, +data[i].Angle, +data[i].Obj];
                //}
                if (Data.length != 0) {
                    dim = Math.max.apply(Math, Data.map(function (d) {
                        return d[2];
                    }));
                }

                tempMaxNorm = Math.max.apply(Math, Data.map(function (d) {
                    return d[0];//finding the maximum of distance
                }));
                if (tempMaxNorm > maxNorm)
                    maxNorm = tempMaxNorm;
            }
            for(z=1;z<arguments.length;z++)
            {
                data=arguments[z];
                Data=CartToPolar(data);
                //for (i=0;i<data.length;i++)
                //{
                //    Data[i]=[+data[i].Norm,+data[i].Angle,+data[i].Obj];
                //}
                if(Data.length!=0)
                {
                    //dim=Math.max.apply(Math, Data.map(function (d) {
                    //    return d[2];
                    //}));
                    dim=Object.keys(data[0]).length;
                }
                if(fileNo==0) {
                    Arcs(mode);
                }
                tempMaxNorm=Math.max.apply(Math, Data.map(function (d) {
                    return d[0];//finding the maximum of distance
                }));
                if(tempMaxNorm>maxNorm)
                    maxNorm=tempMaxNorm;
                drawContext(mode);
                rawData[z-1]=Data;
                fileNo++;
            }
            //transmitScatters();
            legendFilds('scatters');
        }

    })

}
function readData(a)
{
    mode=a;
    if(mode=='relation')
    {
        d3.csv(fileName, function (error, data) {
            for (i = 0; i < data.length; i++)
            {
                Data[i] = [+data[i].Obj1, +data[i].Obj2, +data[i].Obj3];
            }
            if(Data.length!=0)
            {
                dim=Data[0].length;
            }

        });
    }
    else if(mode=='scatters')
    {
        d3.csv(fileName, function (error, data) {
            for (i=0;i<data.length;i++)
            {
                Data[i]=[+data[i].Norm,+data[i].Angle,+data[i].Obj];
            }
            if(Data.length!=0)
            {
                dim=Math.max.apply(Math, Data.map(function (d) {
                    return d[2];
                }));
            }

        });

    }
};

function legendFilds(mode)
{
    if(mode=='relations')
    {
        d3.select('form').select('fieldset')
            .selectAll('g')
            .data(Data[0])
            .enter()
            .append('input')
            .attr('id', function (d, i) {
                return 'Obj' + i.toString();
            })
            .attr('type', 'text')
            .attr('onfocus', 'focusText()')
            .attr('value', function (d, i) {
                return 'Objective ' + i.toString() + ' - Weight ' + i.toString();
            });

        d3.select('form').select('fieldset')
            .append('button')
            .attr('type', 'button')
            .attr('id', 'bSubmit')
            .html('Calculate')
            .attr('onclick', 'submitClick()');
    }
    else
    {
        d3.select('form').select('fieldset')
            .selectAll('div')
            .data(files)
            .enter()
            .append('div')
            .style('color',function (d,i) {
                return colors[i];
            });

        d3.select('form').select('fieldset')
            .selectAll('div')
            .append('label')
            .attr('for',function (d,i) {
                return 'chk'+i;
            })
            .text(function (d,i) {
                return d;
            })
            .append('input')
            .attr('type','checkbox')
            .style('width','20px')
            .attr('id',function (d,i) {
                return 'chk'+i;
            })
            .attr('checked','true')
            .on('change',function (d,i) {
                if(this.checked==true)
                {
                    d3.selectAll('.scatters'+i)
                        .style('opacity',1);
                    d3.selectAll('.scatters'+i).moveToFront();
                }
                else
                {
                    d3.selectAll('.scatters'+i)
                        .style('opacity',0.02);
                    d3.selectAll('.scatters'+i).moveToBack();
                }
            })

        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
                this.parentNode.appendChild(this);
            });
        };
        d3.selection.prototype.moveToBack = function() {
            return this.each(function() {
                var firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });
        };


    }
}

function CartToPolar(data)
{
    var pName=[];
    var tempData=[];
    var v;
    var aux=[];
    var Data=[];
    dim=Object.keys(data[0]).length;
    for(var propertyName in data[0])
    {
        pName.push(propertyName);
    }
    for(i=0;i<data.length;i++)
    {
        tempData[i]=[];
        for(j=0;j<dim;j++)
        {
            pname=pName[j];
            tempData[i][j]=+data[i][pname];
        }
    }
    for(i=0;i<tempData.length;i++)
    {
        v=0;
        for(j=0;j<dim;j++)
        {
            v=v+Math.pow(tempData[i][j],2);
        }
        v=Math.sqrt(v);//v is Norm
        for(j=0;j<dim;j++)
        {
            aux[j]=tempData[i][j]/v;
            aux[j]=Math.acos(aux[j]);
        }
        var Teta=Math.min.apply(null,aux);//Angle
        var Obj=aux.indexOf(Teta);//The minimum angle with the objective axis.
        Data[i]=[v,Teta,Obj+1];
    }
    return Data;
}

function Arcs(mode)
{


    inR=(doc.clientHeight-100)/2; //Inner Radius
    X=doc.clientWidth/2;
    Y=doc.clientHeight/2;
    var usedEnv=360*70/100; //The usable Environment
    var unUsedEnv=(360-usedEnv)/dim; //The distance between arcs
    var arcAngle=usedEnv/dim; //The angle of each Arc


    for(i=0;i<dim;i++)
    {
        Angles[i]=[((i+1)*unUsedEnv)+(i*arcAngle),((i+1)*unUsedEnv)+((i+1)*arcAngle)];
        arcs[i]=d3.svg.arc()
            .innerRadius(inR)
            .outerRadius(inR+0)
            .startAngle(Angles[i][0]*(Math.PI/180))
            .endAngle(Angles[i][1]*(Math.PI/180));

        /*arcsG1[i]=d3.svg.arc()
         .innerRadius(inR/5)
         .outerRadius((inR+0)/5)
         .startAngle(Angles[i][0]*(Math.PI/180))
         .endAngle(Angles[i][1]*(Math.PI/180));
         arcsG2[i]=d3.svg.arc()
         .innerRadius(inR/5*2)
         .outerRadius((inR+0)/5*2)
         .startAngle(Angles[i][0]*(Math.PI/180))
         .endAngle(Angles[i][1]*(Math.PI/180));
         arcsG3[i]=d3.svg.arc()
         .innerRadius(inR/5*3)
         .outerRadius((inR+0)/5*3)
         .startAngle(Angles[i][0]*(Math.PI/180))
         .endAngle(Angles[i][1]*(Math.PI/180));
         arcsG4[i]=d3.svg.arc()
         .innerRadius(inR/5*4)
         .outerRadius((inR+0)/5*4)
         .startAngle(Angles[i][0]*(Math.PI/180))
         .endAngle(Angles[i][1]*(Math.PI/180));*/

        //instead of using the above code to make the grids, I am using the following loop to put all the function in a 1 dimensional array.
        var GridNo=4;
        for(j=0;j<GridNo;j++)
        {
            arcsG[i*GridNo+(j)]=d3.svg.arc()
                .innerRadius(inR/(GridNo+1)*(j+1))
                .outerRadius((inR+0)/(GridNo+1)*(j+1))
                .startAngle(Angles[i][0]*(Math.PI/180))
                .endAngle(Angles[i][1]*(Math.PI/180));
        }

    }


    if(mode=='scatters')
    {
        var arcGSPath = d3.select('#mainSVG').selectAll('.acrGSPath')
            .data(arcsG)
            .enter()
            .append('path')
            .attr('class', 'grid')
            .attr('id', function (d, i) {
                return 'grid' + i.toString();
            })
            .attr('d', function (d, i) {
                return arcsG[i]();
            })
            .attr('stroke', '#e0f2ff')
            .attr('stroke-width', '1')
            .attr('transform', 'translate(' + X + ',' + Y + ')');
    }

    var arcPaths=d3.select('#mainSVG').selectAll('.arcPath')
        .data(arcs)
        .enter()
        .append('path')
        .attr('class','arcPath')
        .attr('id',function(d,i)
        {
            return 'obj'+i.toString();
        })
        .attr('d',function(d,i)
        {
            return arcs[i]();
        })
        .attr('stroke','red')
        .attr('stroke-width','4')
        .attr('transform','translate('+X+','+Y+')')
        .style('fill','white')
        .on('mouseover',function(d,i)
        {
            var idx=i;
            d3.selectAll('.arcPath').attr('opacity',0.2);
            var links=d3.selectAll('.link');
            d3.select(this).attr('opacity',1);
            links[0].forEach(function(d,i)
            {
                if((d.id).search(idx)!=-1)
                {
                    d3.selectAll('#'+d.id).attr('class','linkOnObj');
                }
            });


        })
        .on('click', function (d,i)
        {
            if(mode='scatters') {
                drawVector(i);
            }
        })
        .on('mouseout',function(d,i)
        {
            mainSVG.selectAll('.arcPath').attr('opacity',1);
            mainSVG.selectAll('.linkOnObj').attr('class','link');
        });



    for(i=0;i<arcPaths[0].length;i++)
    {
        tempPath[i]=d3.select(arcPaths[0][i]).node();
        //intervals[i]=d3.scale.linear().domain([0,20]).range([0,tempPath[i].getTotalLength()]);
    }
    //






};

function drawContext(mode)
{
    if(mode=='scatters')
    {
        printScater(tempPath, X, Y, fileNo);
    }
    else
    {
        for(i=0;i<dim;i++)//finding the interval of each objective
        {
            var temp=Data.map(function(obj){ return obj[i]});
            minObj[i]=Math.min.apply(null,temp);
            maxObj[i]=Math.max.apply(null,temp);
        }
        min=Math.min.apply(null,minObj);
        max=Math.max.apply(null,maxObj);
        //map the objectives' interval on the arcs

        var a=d3.select()
        intervals=d3.scale.linear().domain([0,max]).range([0,d3.select('.arcPath').node().getTotalLength()/2]);

        //finding the point on the arcs
        var normVal=[];//finding the normal value of each items on the path befor calculating of coordinate
        var Points=[];//The Points of each value on the Arcs.
        for(i=0;i<Data.length;i++)
        {
            normVal[i]=new Array(dim);
            Points[i]=new Array(dim);
            for(j=0;j<dim;j++)
            {
                normVal[i][j]=intervals(Data[i][j]);
                Points[i][j]=tempPath[j].getPointAtLength(normVal[i][j]);
                Points[i][j].x+=X;
                Points[i][j].y+=Y;
            }
        }
        //Drawing Connections
        var connections=[];
        var lineFunc=d3.svg.line()
            .x(function(d){return d.x;})
            .y(function(d){return d.y;})
            .interpolate('bundle')
            .tension(0.4);
        var rep=(dim*(dim-1))/2; //number of connection group based on number of objectives
        var tempPoint=[];
        for(j1=0;j1<dim;j1++)
        {
            for(j2=j1+1;j2<dim;j2++)
            {
                for(i=0;i<Points.length;i++)
                {

                    tempPoint[i]=new Array(3);
                    tempPoint[i][0]=Points[i][j1];
                    tempPoint[i][1]={x:X,y:Y};//For making Curve in bundle interpolation
                    tempPoint[i][2]=Points[i][j2];

                    d3.select('#mainSVG').append('path')
                        .attr('class','link')
                        .attr('id',function(d,idx)
                        {

                            return 'link'+j1.toString()+"-"+j2.toString()+"-idx"+i.toString();
                        })
                        .attr('d',lineFunc(tempPoint[i]))
                        .on('mouseover',function(d,idx)
                        {
                            var coordinate=d3.mouse(this);
                            d3.select(this).attr('class','linkOver');
                            d3.selectAll('.link').attr('class','linkNoOver');
                            //make tooltip
                            var info=[]; //The information of each link
                            var idText=d3.select(this).attr('id');
                            var O1=+idText[4];
                            var O2=+idText[6];
                            info[0]=Data[+idText.substr(11)][O1];
                            info[1]=Data[+idText.substr(11)][O2];
                            makeTooltip(info,O1,O2,coordinate)

                        })
                        .on('mouseout',function(d,idx)
                        {
                            d3.select(this).attr('class','link');
                            d3.selectAll('.linkNoOver').attr('class','link');
                            d3.selectAll('.tooltip').remove();
                        });
                }

            }
        }
        var tempLinks=mainSVG.selectAll('.link');
        for(i=0;i<tempLinks[0].length;i++)
        {
            linksCoord[i]=new Array(3);
            linksCoord[i][0]=tempLinks[0][i].id;
            linksCoord[i][1]=tempLinks[0][i].getPointAtLength(0);
            linksCoord[i][2]=tempLinks[0][i].getPointAtLength(tempLinks[0][i].getTotalLength());
        }

    }

    //Make the lables on the Arcs
    var lablePos=[]; //Position of lables on arcs
    for(i=0;i<tempPath.length;i++)
    {
        lablePos[i]=[tempPath[i].getPointAtLength(0),tempPath[i].getPointAtLength(tempPath[i].getTotalLength()/2)];
        lablePos[i][0].x+=X;
        lablePos[i][0].y+=Y;
        lablePos[i][1].x+=X;
        lablePos[i][1].y+=Y;
        /*d3.select('#mainSVG').selectAll('#arcLable'+i.toString())
         .data(lablePos[i])
         .enter()
         .append('text')
         .attr('id','arcLable'+i.toString())
         .attr('x',function(d,idx)
         {
         var newP=arcLabelPos(d.x,d.y);
         return newP[0];
         })
         .attr('y',function(d)
         {
         var newP=arcLabelPos(d.x,d.y);
         return newP[1];
         })
         .attr('font-size',18)
         .text(function(d,idx)
         {
         if(idx==0)
         return min.toString()+"     Obj"+i;
         else
         return max.toString();
         });*/
        d3.select('#mainSVG').selectAll('#arcLable'+i.toString())
            .data(lablePos[i])
            .enter()
            .append('text')
            .attr('id','arcLable'+i.toString())
            .attr("x", function (d,idx) {
                if(idx==0)
                    return 0;
                else
                    return (tempPath[i].getTotalLength()/2)-50;
            })
            .attr("dy", -15)
            .append("textPath")
            .attr("class", "textpath")
            .attr("xlink:href", "#"+tempPath[i].id)
            .text(function(d,idx)
            {
                if(idx==0)
                {
                    maxNorm=(maxNorm*100000);
                    maxNorm=Math.round(maxNorm);
                    maxNorm=maxNorm/100000;
                    return "Obj" + i + "-" + min.toString() + "-MaxNorm: " + maxNorm;
                }
                else {
                    var a=Math.round(max*10000)/10000;
                    return a.toString();
                }
            });

        /*d3.select('#mainSVG').selectAll('.gridText')
                             .data(arcsG)
                             .enter()
                             .append('text')
                             .attr('class','gridText')
                             .append('textPath')
                             .attr('xlink:href',function(d,i) {
                                return '#grid'+i.toString();
                              })
                             .text(function (d,i) {
                                 return i;
                             });*/

    }

}

function arcLabelPos(x,y)
{
    var v=[(x-X),(y-Y)];
    var u=[(v[0]/(Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)))),(v[1]/(Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2))))];
    var newPoint=[(X+(inR+30)*u[0]),(Y+(inR+30)*u[1])];
    return newPoint;
}

function drawVector(pathNo) {
    var X = doc.clientWidth / 2;
    var Y = doc.clientHeight / 2;
    mainSVG.selectAll('.tempPoint').remove();
    mainSVG.selectAll('.tempVector').remove();
    var selectedPoint = d3.mouse(doc);
    mainSVG.append('circle')
        .attr('class', 'tempPoint')
        .attr('r', 3)
        .attr('cx', selectedPoint[0])
        .attr('cy', selectedPoint[1])
        .style('fill', '0091FF');

    //mainSVG.append('line')
    //    .attr('id', 'vector')
    //    .attr('class', 'tempVector')
    //    .attr('x1', X)
    //    .attr('y1', Y)
    //    .attr('x2', selectedPoint[0])
    //    .attr('y2', selectedPoint[1])
    //    .style('stroke', 'Cyan')
    //    .style('stroke-width', '2');

    var lineData=[{"x":X,"y":Y},{"x": selectedPoint[0],  "y": selectedPoint[1]}];
    var lineFunc=d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        });
    var linePath=mainSVG.append("path")
        .attr('id', 'vector')
        .attr('class', 'tempVector')
        .attr('d',lineFunc(lineData))
        .attr('stroke','cyan')
        .attr('stroke-width','2')
        .attr('fill','none');

    //Calculating Alpha
    var xPrim = Math.abs(selectedPoint[0] - X);
    var yPrim = Math.abs(selectedPoint[1] - Y);
    var alpha = Math.atan(yPrim / xPrim);//Gradian
    //var Alpha = (alpha * 360) / (2 * Math.PI);//Degree
    var Gama,xText,yText;
    if (X <= selectedPoint[0] && Y >= selectedPoint[1]) {
        Gama = Math.PI/2 - alpha;


    }
    else if (X < selectedPoint[0] && Y < selectedPoint[1]) {
        Gama = Math.PI/2 + alpha;
    }
    else if (X > selectedPoint[0] && Y < selectedPoint[1]) {

        Gama = 3*Math.PI/2 - alpha;
    }
    else if (X>selectedPoint[0] && Y>selectedPoint[1]) {
        Gama = 3*Math.PI/2 + alpha;
    }
    var sAngel=(Angles[pathNo][0]*Math.PI)/180; //Convert the start angel to Gradient.
    var eAngel=(Angles[pathNo][1]*Math.PI)/180; //Convert the end angel to Gradient.
    var teta=Gama-sAngel;//The angel
    var Teta=(teta*maxTeta)/(eAngel-sAngel);

    //Calculating the Cartesian
    var z=Math.cos(Teta);
    var x=(Math.sin(Teta)*maxNorm)/Math.sqrt(dim-1);
    var cartCord=[];
    for(i=0;i<dim;i++)
    {
        if(i==pathNo)
        {
            cartCord.push(z);
        }
        else
        {
            cartCord.push(x);
        }
        cartCord[i]=Math.round(cartCord[i]*100)/100;
    }
    var cartText=" ";
    for(i=0;i<cartCord.length;i++)
    {
        cartText=cartText+cartCord[i].toString();
        if(i!=cartCord.length-1)
            cartText+=",";
    }

    //Add Text
    d3.selectAll('.tetaText').remove();
    var text = mainSVG.append("text")
        .attr('class','tetaText')
        .style('font-size','18px')
        .attr('font-weight','bold')
        .attr("dx", 15)
        .attr("dy", 5);
     //   .text(Teta);
    var tempTeta=Math.round((Teta*10000))/10000;
    text.append("textPath")
        .attr("xlink:href","#vector")
        .text(tempTeta+" --  Cart: "+cartText);


}

function makeTooltip(info,O1,O2,coordinate)
{
  var toolTipSVG=d3.select('#mainSVG').append('svg')
                       .attr('class','tooltip')
                       .attr('width',220)
                       .attr('height',75)
                       .attr('x',coordinate[0]+15)
                       .attr('y',coordinate[1]-20);
  toolTipSVG.append('rect')
            .attr('width',220)
            .attr('height',75)
            .attr('x',0)
            .attr('y',0)
            .attr('stroke','black')
            .attr('stroke-width',2)
            .attr('stroke-opacity',0.8)
            .attr('opacity',0.9)
            .attr('fill','#7CFF8A');

  var toolText=toolTipSVG.append('text')
                       .attr('class','tooltipTitle')
                       .attr('x',10)
                       .attr('y',20)
                       .text('This link connects:');

  var info1=['Objective '+(O1+1).toString()+': ',
              info[0],
              'Objective '+(O2+1).toString()+': ',
              info[1]];
  toolText.selectAll('tspan')
                       .data(info1)
                       .enter()
                       .append('tspan')
                       .attr('class',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 'tooltipTitle';
                          else
                            return 'tooltipVal';
                       })
                       .attr('dy',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 20;
                          else
                            return 0;
                       })
                       .attr('x',20)
                       .attr('dx',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 0;
                          else
                            return 82;
                       })
                       .text(function(d,idx)
                        {
                          return info1[idx];
                        });
};


function printScater(pathNo,X,Y,fileNo)
{

    //The data stracture is 'Distance', 'Angel', 'Objective'
    maxTeta=(Math.acos(1/(Math.sqrt(dim))));


    var intervals=d3.scale.linear().domain([0,maxTeta]).range([0,d3.select('.arcPath').node().getTotalLength()/2]);

    //calculate the position of angels on the arcs
    for(i=0;i<Data.length;i++)
    {
        var temp=intervals(Data[i][1]);
        angelPos[i]=pathNo[Data[i][2]-1].getPointAtLength(temp);
        angelPos[i].x+=X;
        angelPos[i].y+=Y;
    }

    var scatters=d3.select('#mainSVG')
        .selectAll('.scatters'+fileNo.toString())
        .data(angelPos)
        .enter()
        .append('circle')
        .attr('cx',function(d,i){return angelPos[i].x;})
        .attr('cy',function(d,i){return angelPos[i].y;})
        .attr('id',function (d,i) {
            return 'solution'+fileNo.toString()+i.toString();
        })
        .attr('r',4)
        .attr('class',function (d,i) {
            return 'scatters'+fileNo.toString();
        })
        .on('mouseover',function (d,i) {
            scatterTooltip(fileNo,i,angelPos[i]);
        })
        .on('mouseout',function (d,i) {
            d3.selectAll('.scatterTooltip').remove();

        })
        .style('fill',function (d,i) {
            //var objNo=Data[i][2]-1;
            return colors[fileNo];
        });
    transmitScatters(scatters);
    min=0;
    max=maxTeta;

}

function transmitScatters(scatters)
{

    var lineFunc=d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate('linear');
    //Calculate the distance
    lineData=[{'x':X,'y':Y},{'x':angelPos[0].x,'y':angelPos[0].y}];
    var linePath=d3.select('#mainSVG').append('path').attr('class','distance').attr('d',lineFunc(lineData));
    var normIntervals=d3.scale.linear().domain([0,maxNorm]).range([0,inR]);//linePath.node().getTotalLength()]);
    for(i=0;i<Data.length;i++)
    {
        lineData=[{'x':X,'y':Y},{'x':angelPos[i].x,'y':angelPos[i].y}];
        var linePath=d3.select('#mainSVG').append('path').attr('class','distance').attr('d',lineFunc(lineData));
        var temp=normIntervals(Data[i][0]);
        finalPos[i]=linePath[0][0].getPointAtLength(temp);
    }
    //in order to transfer the scatters in to the correct positions


        scatters.transition()
            .duration(22000)
            .attr('cx', function (d, i) {
                return finalPos[i].x;
            })
            .attr('cy', function (d, i) {
                return finalPos[i].y;
            })
    //delete lines.
    d3.selectAll('.distance').remove();
}

function scatterTooltip(f,i,pos)
{
    mainSVG.append('text')
        .attr('class','scatterTooltip')
        .attr('x',d3.select('#solution'+f.toString()+i.toString()).attr('cx')+3)
        .attr('y',d3.select('#solution'+f.toString()+i.toString()).attr('cy')+3)
        .html("Norm: "+rawData[f][i][0]+" , Angle: "+rawData[f][i][1]);
}

function mouseDown()
{
  selectingPoints[0]=d3.mouse(this);
  mainSVG.selectAll('.link').attr('class','unSelectedLink');
  sRect=d3.select('#mainSVG').append('rect')
                             .attr('x',selectingPoints[0][0])
                             .attr('y',selectingPoints[0][1])
                             .attr('width',0)
                             .attr('height',0)
                             .attr('class','selectionFrame');

  d3.select('#mainSVG').on('mousemove',mouseMove);
};
function mouseUp()
{
  mainSVG.on('mousemove',null);
  mainSVG.selectAll('rect').remove();
};

function mouseMove()
{
    mainSVG.selectAll('.link').attr('class','unSelectedLink');
    selectingPoints[1]=d3.mouse(this);
    var sX,sY;
    var w=Math.abs(selectingPoints[1][0]-selectingPoints[0][0]);
    var h=Math.abs(selectingPoints[1][1]-selectingPoints[0][1]);
    sRect.attr('x',function(d)
                   {
                     if(selectingPoints[0][0]<=selectingPoints[1][0])
                     {
                        sX=selectingPoints[0][0];
                        return sX;
                     }
                     else
                     {
                        sX=selectingPoints[1][0];
                        return sX;
                     }
                   })
         .attr('y',function(d)
                   {
                     if(selectingPoints[0][1]<=selectingPoints[1][1])
                     {
                        sY=selectingPoints[0][1];
                        return sY;
                     }
                     else
                     {
                        sY=selectingPoints[1][1];
                        return sY;
                     }
                   })
         .attr('width',w)
         .attr('height',h);

    function selectLink(value,idx,arr)
    {
      if(value[1].x>sX && value[1].x<sX+w && value[1].y>sY && value[1].y<sY+h)
      {
        return true;
      }
      if(value[2].x>sX && value[2].x<sX+w && value[2].y>sY && value[2].y<sY+h)
      {
        return true;
      }
      return false;
    };
    selectedLinks=linksCoord.filter(selectLink);
    //d3.selectAll('.link').attr('stroke','blue');
    for(i=0;i<selectedLinks.length;i++)
    {
      mainSVG.select('#'+selectedLinks[i][0]).attr('class','selectedLink');
    }

};

function Reset()
{
    if(mode='scatters')
    {
        var clickPoint=d3.mouse(doc);
        var l=Math.sqrt(Math.pow((clickPoint[0]-X),2)+Math.pow((clickPoint[1]-Y),2));
        if(l>inR+6) {
            mainSVG.selectAll('.tempPoint').remove();
            mainSVG.select('.tempVector').remove();
        }
    }
    else
    {
        mainSVG.selectAll('.unSelectedLink').attr('class', 'link');
        mainSVG.selectAll('.selectedLink').attr('class', 'link');
        mainSVG.selectAll('.coloredLink').attr('class', 'link');
    }
}

function focusText(id)
{
  document.activeElement.value=null;
}

function submitClick()
{
  d3.selectAll('.coloredLink').attr('class','link')
  var weights=[],goals=[],max=[],v;
  var inputs=d3.select('form').selectAll('input');
  for(i=0;i<inputs[0].length;i++)
  {
    var tempO=inputs[0][i].value.slice(0,inputs[0][i].value.indexOf('-'));
    var temp1=inputs[0][i].value.slice(inputs[0][i].value.indexOf('-')+1,inputs[0][i].value.length);
    if(!isNaN(parseFloat(tempO)) && !isNaN(parseFloat(temp1)))
    {
      goals[i]=parseFloat(tempO);
      weights[i]=parseFloat(temp1);
    }
    else
    {
      d3.select('#'+inputs[0][i].id).style('background-color','yellow').attr('value','Enter Standard Value');
    }
  }

  var links=mainSVG.selectAll('.link');
  var colored=Vikor(goals,maxObj,weights,0.9);

  //Painting Links

  for(i=0;i<links[0].length;i++)
  {
    d3.select('#'+links[0][i].id).attr('class','coloredLink').attr('stroke',function(){
                                                    var idx=links[0][i].id;
                                                    idx=+(idx.slice(idx.indexOf('x')+1,idx.length));
                                                    return colored[idx];
                                                 });
  }
}

function Vikor(goal,max,w,V)
{

  var normaled=[];// The normaled datas
  for(i=0;i<Data.length;i++)
  {
    normaled[i]=new Array(3);
  }

  //Normalizing
  for(j=0;j<dim;j++)//The column
  {
    var sum=0;
    for(i=0;i<Data.length;i++)//sumation of each column
    {
      sum=sum+(Math.pow(Data[i][j],2));
    }
    for(i=0;i<Data.length;i++)
    {
      normaled[i][j]=Data[i][j]/Math.sqrt(sum);
    }
  }

  //Calculate the distance to the goal
  var ss=0,rr=[];
  var S=[],R=[];
  for(i=0;i<normaled.length;i++)
  {
    ss=0;
    for(j=0;j<normaled[0].length;j++)
    {
      ss=ss+(w[j]*((goal[j]-normaled[i][j])/(goal[j]-max[j])));
      rr[j]=w[j]*(goal[j]-normaled[i][j])/(goal[j]-max[j]);
    }
    S[i]=ss;
    R[i]=Math.max.apply(null,rr);
  }
  var Smax=Math.max.apply(null,S);
  var Smin=Math.min.apply(null,S);
  var Rmax=Math.max.apply(null,R);
  var Rmin=Math.min.apply(null,R);
  var Q=[];//The ranked point. It means the less distance is the best
  for(i=0;i<S.length;i++)
  {
    Q[i]=(V*(Smin-S[i])/(Smin-Smax))+((1-V)*(Rmin-R[i])/(Rmin-Rmax));
  }
  var Q1=[];
  for(i=0;i<Q.length;i++)
  {
    Q1[i]=Q[i];
  }
  var sorted=Q1.sort(function(a,b){return b-a;});
  var ranked=Q.map(function(v){ return sorted.indexOf(v)+1;});
  var colors=d3.scale.quantize().domain([1,Math.max.apply(null,ranked)]).range(['#FF381B','#FF5A1B','#FF7C1B','#FF9A1B','#FFB51B','#FFCF1B']);
  var trans=d3.scale.linear().domain([1,Math.max.apply(null,ranked)]).range([1,0]);
  var colored=[];//save the color of each solution
  for(i=0;i<Q.length;i++)
  {
    colored[i]=colors(ranked[i]);
  }

  return colored;


}
