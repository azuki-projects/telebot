const TelegramBot=require("node-telegram-bot-api");
const s=require("./setting.json");
const db=require("./handlers/database");
const loader=require("./handlers/commandHandler");
const token=process.env.BOT_TOKEN||s.token;
if(!token||token.startsWith("YOUR_"))throw new Error("Set BOT_TOKEN in Render environment or setting.json");
const bot=new TelegramBot(token,{polling:true});
bot.commands=loader.commands;
bot.aliases=loader.aliases;
bot.sendText=(chatId,text,opts={})=>bot.sendMessage(chatId,text,opts);
bot.on("polling_error",e=>console.error("Polling:",e.message));
bot.on("message",async msg=>{
 if(!msg.text||!msg.from)return;
 const text=msg.text.trim();
 const isPrivate=msg.chat.type==="private";
 let commandText=text;
 if(text.startsWith("/"))commandText=text;
 else if(isPrivate)commandText=text;
 else return;
 const parts=commandText.split(/\s+/);
 const first=parts[0].split("@")[0].replace(/^\/+/,"").toLowerCase();
 const args=parts.slice(1);
 const commandName=loader.aliases.get(first)||first;
 let cmd=loader.commands.get(commandName);
 if(!cmd&&text.startsWith("/"))cmd=loader.commands.get("unknown");
 if(!cmd)return;
 const id=String(msg.from.id);
 try{
  const u=await db.getUser(msg.from);
  if(u.banned&&!db.isAdmin(msg.from)){const notice="⛔ You have been banned from using the bot. If you think this is a mistake please PM @itzdiablodan";try{await bot.sendText(id,notice)}catch(e){if(isPrivate)bot.sendText(msg.chat.id,notice);else bot.sendText(msg.chat.id,"This account is banned.")}return;}
  const isAdmin=db.isAdmin(msg.from);
  await cmd.run({id,u,args:cmd.meta.name==="unknown"?[first,...args]:args,bot,msg,isAdmin,loader,chatId:msg.chat.id,replyTarget:msg.reply_to_message?.from,db});
 }catch(e){
  console.error("Command error:",e);
  bot.sendText(msg.chat.id,"Command error: "+e.message,{reply_to_message_id:msg.message_id});
 }
});
require("./handlers/web")(db);
db.connect().then(()=>console.log("Telegram bot online")).catch(e=>console.error("MongoDB connection failed:",e));
