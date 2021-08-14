//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pruthvi:Pruthvi@123@cluster0.igqvj.mongodb.net/todolistDB",{useNewUrlParser:true});

const todolistSchema=new mongoose.Schema({
  name:String
})

const Item = new mongoose.model("Item",todolistSchema);

const item1 = new Item({
  name: "welcome to a todo list"
})
const item2 = new Item({
  name : "hit + button to add new item"
})
const item3 = new Item({
  name : "<--click to delete an item"
})

defaultItems=[item1,item2,item3];

const ListSchema= mongoose.Schema({
  name:String,
  list: [todolistSchema]
})

const List = mongoose.model("list",ListSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundResult){
  if(foundResult.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("success");
      }
    });
    res.redirect("/");
    }
    
    else{
      res.render("list", {listTitle:"Today",newListItems: foundResult});
    }
  });

});

app.post("/delete",function(req,res){
const checked=req.body.checkbox;
const ListName=req.body.listName;

if(ListName==="Today"){
  Item.findByIdAndRemove(checked,function(err){
    if(err){
           console.log(err);
         }
         res.redirect("/");
  })
}
else{
  List.findOneAndUpdate({name:ListName},{$pull:{list:{_id:checked}}},function(err,foundResult){
    if(!err){
      res.redirect("/"+ ListName);
    }
  })
}
})


app.post("/", function(req, res){


  const itemName = req.body.newItem;
  const listName =req.body.list;

  const item = new Item({
    name:itemName
  })
  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundResult){
      foundResult.list.push(item);
      foundResult.save();
      res.redirect("/"+ listName);
    })
  }
});

app.get("/:place", function(req,res){
  const customListName=_.capitalize(req.params.place);
 List.findOne({name:customListName},function(err,foundResult){
    if(!err){
      if(!foundResult){
        const ListItem= new List({
          name:customListName,
          list:defaultItems
        });
        ListItem.save();
        res.redirect("/" + customListName);
      }
    else{
      res.render("list",{listTitle:foundResult.name,newListItems: foundResult.list});
      
    }
  }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
