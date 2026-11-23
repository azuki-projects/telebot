const TelegramBot=require("node-telegram-bot-api");
const s=require("./setting.json");
const db=require("./handlers/database");
const loader=require("./handlers/commandHandler");
const bot=new TelegramBot(s.token,{polling:true});
bot.commands=loader.commands;
bot.aliases=loader.aliases;
bot.sendText=(chatId,text,opts={})=>bot.sendMessage(chatId,text,opts);
bot.on("polling_error",e=>console.error("Polling:",e.message));
bot.on("message",async msg=>{
 if(!msg.text||!msg.from)return;
 const text=msg.text.trim();
 const isPrivate=msg.chat.type==="private";
 let commandText=text;
 if(text.startsWith("/")){
  commandText=text;
 }else if(isPrivate){
  // Prefixless commands are accepted only in private chats and only when the first word is a known command.
  commandText=text;
 }else return;
 const parts=commandText.split(/\\s+/);
 let first=parts[0].split("@")[0].replace(/^\\//,"").toLowerCase();
 const args=parts.slice(1);
 const commandName=loader.aliases.get(first)||first;
 const cmd=loader.commands.get(commandName);
 if(!cmd)return;
 const id=String(msg.from.id);
 try{
  const u=await db.getUser(msg.from);
  const isAdmin=db.isAdmin(msg.from);
  await cmd.run({id,u,args,bot,msg,isAdmin,loader,chatId:msg.chat.id,replyTarget:msg.reply_to_message?.from});
 }catch(e){
  console.error("Command error:",e);
  bot.sendText(msg.chat.id,"Command error: "+e.message,{reply_to_message_id:msg.message_id});
 }
});
db.connect().then(()=>console.log("Telegram bot online")).catch(e=>console.error("MongoDB connection failed:",e));
