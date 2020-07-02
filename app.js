const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin_nguyenxloc:Loclocloc952001@cluster0-abvcz.mongodb.net/toDoListDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Items",itemsSchema);

const listSchema ={
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("Lists", listSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

const firstItem = new Item({
  name: "Welcome to the To Do List app."
});

const secondItem = new Item({
  name: "Please add more item down here."
})

var defaultItem = [firstItem, secondItem];

app.get("/", function(req,res){
  Item.find({},function(err, findedItem){
    if(findedItem.length === 0){
      Item.insertMany(defaultItem,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully created the default to do list.");
        }
      })
    }
    res.render("list", {listTitle: "Today", newListItem: findedItem});
  })
});

app.get("/:nameList",function(req,res){
  const nameList = _.capitalize(req.params.nameList);
  var existed = false;

  List.findOne({name: nameList},function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        const list = new List({
          name: nameList,
          items: defaultItem
      })
      list.save();
      res.redirect("/"+nameList);
      }
      else{
      res.render("list",{listTitle:nameList,newListItem: foundList.items})
     }
    }
  })
})

app.get("/about",function(req,res){
  res.render("about")
})

app.post("/",function(req,res){
  const listName = req.body.list;
  const newItem = new Item({
    name: req.body.newItem
  })

  if(listName ==="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err,foundList){
      if(!err){
        foundList.items.push(newItem);
        foundList.save()
        res.redirect("/"+listName);
      }else{
        console.log(err);
      }
    })
  }
})

app.post("/delete",function(req,res){
  const deletedID = req.body.deletedID;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.deleteOne({_id: deletedID}, function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
  })
}
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:deletedID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }else {
        console.log(err);
      }
    })
  }
})

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is up and running on port 3000");
})
