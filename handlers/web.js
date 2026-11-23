const express=require("express"),path=require("path");
module.exports=function(db,bot){
 const app=express();
 app.use(express.json({limit:"32kb"}));app.use(express.static(path.join(__dirname,"../public")));
 async function notify(tgId,message){try{if(bot)await bot.sendMessage(String(tgId),message)}catch(e){console.log("Admin panel notification failed:",e.message)}}
 app.get("/api/stats",async(req,res)=>{try{res.json({users:await db.User.countDocuments(),banned:await db.User.countDocuments({banned:true}),admins:(await db.listAdmins()).length})}catch(e){res.status(500).json({error:e.message})}});
 app.get("/api/users",async(req,res)=>{try{const q=String(req.query.q||"").trim().slice(0,60);let filter={};if(q)filter={$or:[{tgId:q},{username:{$regex:q,$options:"i"}},{displayName:{$regex:q,$options:"i"}}]};const rows=await db.User.find(filter).sort({updatedAt:-1}).limit(100).select("tgId username displayName money banned banReason pet createdAt updatedAt").lean();res.json(rows)}catch(e){res.status(500).json({error:e.message})}});
 app.post("/api/users/:id/balance",async(req,res)=>{try{const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<0||amount>1e15)return res.status(400).json({error:"Balance must be 0 to 1 quadrillion"});const u=await db.User.findOneAndUpdate({tgId:req.params.id},{$set:{money:amount}},{new:true});if(!u)return res.status(404).json({error:"User not found"});await notify(u.tgId,"💰 YOUR BALANCE WAS CHANGED BY AN ADMIN\n\nNew balance: "+amount.toLocaleString());res.json({ok:true,money:u.money})}catch(e){res.status(500).json({error:e.message})}});
 app.post("/api/users/:id/ban",async(req,res)=>{try{const u=await db.User.findOneAndUpdate({tgId:req.params.id},{$set:{banned:true,banReason:String(req.body.reason||"Restricted by admin").slice(0,200)}},{new:true});if(!u)return res.status(404).json({error:"User not found"});await notify(u.tgId,"⛔ You have been banned from using the bot. If you think this is a mistake please PM @itzdiablodan\n\nReason: "+u.banReason);res.json({ok:true})}catch(e){res.status(500).json({error:e.message})}});
 app.post("/api/users/:id/unban",async(req,res)=>{try{const u=await db.User.findOneAndUpdate({tgId:req.params.id},{$set:{banned:false,banReason:""}},{new:true});if(!u)return res.status(404).json({error:"User not found"});await notify(u.tgId,"✅ YOUR BOT BAN HAS BEEN REMOVED BY AN ADMIN\n\nYou can use the bot again.");res.json({ok:true})}catch(e){res.status(500).json({error:e.message})}});
 app.get("/api/admins",async(req,res)=>{try{res.json(await db.listAdmins())}catch(e){res.status(500).json({error:e.message})}});
 app.post("/api/admins",async(req,res)=>{try{const id=await db.addAdmin(req.body.identifier);res.json({ok:true,identifier:id})}catch(e){res.status(400).json({error:e.message})}});
 app.delete("/api/admins/:identifier",async(req,res)=>{try{await db.removeAdmin(decodeURIComponent(req.params.identifier));res.json({ok:true})}catch(e){res.status(400).json({error:e.message})}});
 app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"../public/index.html")));
 app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"../public/index.html")));
 const port=Number(process.env.PORT||s.port||3000);app.listen(port,"0.0.0.0",()=>console.log("Admin panel listening on "+port));
};
