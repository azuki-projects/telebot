const db=require("../handlers/database"),eco=require("../handlers/economy");

function label(u){
  return u.username?"@"+u.username:(u.displayName||"User "+u.tgId);
}
function rank(n){
  return n===1?"🥇":n===2?"🥈":n===3?"🥉":n+".";
}
module.exports={
  meta:{
    name:"leaderboard",
    aliases:["lb"],
    description:"View richest users and strongest pets",
    usage:"/leaderboard",
    category:"Info"
  },
  async run({chatId,bot,msg}){
    const users=await db.User.find({}).lean();
    const members=users.filter(u=>!db.isAdmin({id:u.tgId,username:u.username}));

    const richest=members
      .sort((a,b)=>(Number(b.money)||0)-(Number(a.money)||0))
      .slice(0,15);

    const wealth=["🏆 RICHEST PLAYERS — TOP 15",""];
    if(!richest.length)wealth.push("No players yet.");
    else richest.forEach((u,i)=>wealth.push(rank(i+1)+" "+label(u)+" — "+eco.fmt(u.money)+" coins"));

    const pets=members
      .filter(u=>u.pet&&u.pet.name)
      .sort((a,b)=>(Number(b.pet.strength)||0)-(Number(a.pet.strength)||0)
        ||(Number(b.pet.level)||0)-(Number(a.pet.level)||0)
        ||(Number(b.pet.wins)||0)-(Number(a.pet.wins)||0))
      .slice(0,10);

    const strongest=["🐾 STRONGEST PETS — TOP 10",""];
    if(!pets.length)strongest.push("No pets yet.");
    else pets.forEach((u,i)=>{
      const p=u.pet;
      strongest.push(rank(i+1)+" "+(p.emoji||"🐾")+" "+p.name+" — "+label(u));
      strongest.push("   ⚔️ Strength: "+(p.strength||0)+" | Lv."+ (p.level||1)+" | ❤️ Health: "+(p.health||0)+"/"+(p.maxHealth||0));
      strongest.push("   🛡️ Shield: "+(p.shield||0)+" | 🏆 Wins: "+(p.wins||0)+" | ❌ Losses: "+(p.losses||0));
    });

    await bot.sendText(chatId,wealth.join("\n"),{reply_to_message_id:msg.message_id});
    return bot.sendText(chatId,strongest.join("\n"));
  }
};
