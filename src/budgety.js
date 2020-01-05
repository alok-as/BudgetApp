//Budgety  
// Dividing the application in 3 modules-
// 1.Budget Controller 
// 2.UI Controller
// 3.Controller


//Budget Controller 
var budgetController =(function() {    

    // Creating the Data Structure for storing the data
    var Expense=function(id,description,value) {

        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;

    };

    Expense.prototype.calcPercentage=function(totalIncome){

        if(totalIncome>0) {
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else {
            this.percentage=-1;
        }

    };

    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };

    var Income=function(id,description,value) {

        this.id=id;
        this.description=description;
        this.value=value;



    };    

    var data= {

        allItems: {
            exp:[],
            inc:[]
        },

        totals: {
            exp:0,
            inc:0
        },
        
        budget:0,
        percentage:-1
    
    };

    var calculateTotal=function(type) {

        var sum=0;
        
        data.allItems[type].forEach(function(curr,index,arry) {
            sum+=curr.value;
         });

         data.totals[type]=sum;


    };

    return {

        addItem:function(type,des,val) {
            
            var newItem,ID;

            //Generating a New ID
            if(data.allItems[type].length>0) {
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else {
                ID=0;
            }


            // Creating the new Item
            if(type==='exp') {
                    newItem= new Expense(ID,des,val);
            } else if(type==='inc') {
                newItem=new Income(ID,des,val);
            }

            // Pushing the item into the data structure
            data.allItems[type].push(newItem);

            return newItem;

        },

        deleteItem:function(type,id) {

            var ids,index;

            ids =data.allItems[type].map(function(current){
                return current.id;
            });

            index= ids.indexOf(id);
  
            if(index !==-1){
                data.allItems[type].splice(index,1);
            }

        },

        calculateBudget:function() {

            //Calculate Total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the Budget
            data.budget=(data.totals.inc-data.totals.exp);

            //Calculate the percentage of income spent
            if(data.totals.inc>0){
                data.percentage= Math.round((data.totals.exp/data.totals.inc)*100);
            }

        },

        calculatePercentages:function() {

            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });

            
        },

        getPercentages:function(){

            var allPerc=data.allItems.exp.map(function(curr){
                return curr.getPercentage(); 
            });

            return allPerc;
            
        },

        getBudget:function() {

            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage

            }

        },

        testing:function() {
            console.log(data);
        }
    };



})();



// UI Controller
var uIController =(function() {

    var DOMstrings= {
        inputType:'.add_type',
        inputDescription:'.add_description',
        inputValue:'.add_value',
        inputBtn:'.add_btn',
        incomeContainer:'.income_list',
        expensesContainer:'.expenses_list',
        incomeLabel:'.budget_income-value',
        expensesLabel:'.budget_expenses-value',
        budgetLabel:'.budget_value',
        percentageLabel:'.budget_expenses-percentage',
        container:'.container',
        expensesPercLabel:'.item_percentage',
        dateLabel:'.budget_title-month'
    };

    var formatNumber= function(num,type){
            
        var numSplit,int,dec;

        num=Math.abs(num);

        //Roun to fix decimal places
        num=num.toFixed(2);

        //Adding the sign
        numSplit=num.split('.');

        int= numSplit[0];

        if(int.length>3){
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }

        dec=numSplit[1];

        return (type==='exp'?'-':'+')+' '+int+'.'+dec;
        
    };

    var nodeListForEach= function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };

    return {

        // To Grab Input Values
        getInput:function() {
            
            return {
                
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            }

        },

        addListItem:function(obj,type) {

            var html,newHtml,element;
     
            //Construct HTMl String with placeholder text
            if(type==='inc') {
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn"><i class="fas fa-trash-alt"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn"><i class="fas fa-trash-alt"></i></button></div></div></div>';
            }
            


            //Replace the Placeholder text with actual data
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));


            //Add to the UI
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);

        },

        deleteListItem:function(selectorId) {
            
            var el;
            el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        },

        clearFields:function() {
            
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array) {
                current.value="";
            });

            fieldsArr[0].focus();

        },

        displayBudget:function(obj) {
            
            var type;
            obj.budget>0?type="inc":type="exp";
           
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,"exp");
        
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent='--';
            }
        },

        displayPercentages:function(percentages){

            var fields=document.querySelectorAll(DOMstrings.expensesPercLabel);

            
            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+'%'
                }else{
                    current.textContent='--';
                }
    
            });
        },

        displayMonth:function(){
            
            var now,year,month,months;

            now =new Date();
            year= now.getFullYear();
            months=['January','Februry','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent=months[month]+", "+year;

        },

        changeType:function(){

            var fields=document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDescription+','+
                DOMstrings.inputValue);

                nodeListForEach(fields,function(curr){
                curr.classList.toggle("red-focus");
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");

        },

        getDOMstrings:function() {
            return DOMstrings;
        }

    };


})();



// Controller
var Controller=(function(budgetCtrl,UICtrl){

    var setupEventListeners=function() {

        var DOM= UICtrl.getDOMstrings();

        // Implementing the Add Btn 
        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);

        document.addEventListener("keypress",function(event) {

            if(event.keyCode===13||event.which===13) {

                ctrlAddItem();
                
            }



        });

        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changeType);
    };

    var updateBudget=function() {
        
        //Calculate the Budget
        budgetCtrl.calculateBudget();

        //Return the Budget
        var budget=budgetCtrl.getBudget();

        //Update the Budget in the UI
        UICtrl.displayBudget(budget);
    
    };

    var updatePercentages=function(){

        // Calculate the Percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from the budget controller
        var percentages= budgetCtrl.getPercentages();

        //Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };

   
    var ctrlAddItem = function() {

        var input,newItem;

        // Grab Input Values
        input=UICtrl.getInput();

        if((input.description !=="")&& (!isNaN(input.value)) && input.value>0) {
            
            //Add item to the Budget Controller
            newItem=budgetCtrl.addItem(input.type,input.description,input.value);
    
            //Update the UI
            UICtrl.addListItem(newItem,input.type);
            
            //Clearing theinput fields
            UICtrl.clearFields();
    
            //Calculate and Update budget        
            updateBudget();
            
            //Calculate and update Percentages
            updatePercentages();

            
        };


    };

    var ctrlDeleteItem=function(event) {
        
        // console.log(event.target.parentNode.parentNode.id);
        var itemId,splitId,type,ID;
        
        itemId=(event.target.parentNode.parentNode.id);
        
        if(itemId){
            splitId=itemId.split("-");
            type=splitId[0];
            ID= parseInt(splitId[1]);

        }

        // Delete the item from the data strucutre
        budgetCtrl.deleteItem(type,ID);
        
        //Delete the item from the user interface
        UICtrl.deleteListItem(itemId);

        //Update the Budget
        updateBudget();

        //Calculate and update Percentages
        updatePercentages();

    };


    return {

        init:function() {

            // Calling the Function to set up the Event Listeners
            setupEventListeners();

            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:0

            });

            UICtrl.displayMonth();
            
        }

    }




})(budgetController,uIController);


//Calling the Game Initializtion Function
Controller.init();

