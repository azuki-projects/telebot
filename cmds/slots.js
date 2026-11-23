const eco=require("../handlers/economy");
const symbols=["🍒","🍋","🍇","🍉","⭐","💎","7️⃣"];

module.exports={
  meta:{
    name:"slots",
    aliases:["slot","5slot"],
    description:"Spin a five-slot machine",
    usage:"/slots <bet>",
    category:"Games"
  },
  async run({chatId,u,args,msg,bot}){
    const bet=eco.parseAmount(args[0]);
    if(!Number.isFinite(bet)||bet<=0||bet>u.money)
      return bot.sendText(chatId,"Usage: /slots <bet> (your balance: "+eco.fmt(u.money)+")");

    const s=Array.from({length:5},()=>symbols[Math.floor(Math.random()*symbols.length)]);
    const counts={};
    s.forEach(x=>counts[x]=(counts[x]||0)+1);
    const max=Math.max(...Object.values(counts));

    // Payout is the total returned (includes the original bet).
    let multiplier=0;
    if(max===5) multiplier=10;
    else if(max===4) multiplier=5;
    else if(max===3) multiplier=3;
    else if(max===2) multiplier=2;

    const payout=bet*multiplier;
    u.money=u.money-bet+payout;
    await u.save();

    const result=multiplier
      ? "🎉 WIN: "+multiplier+"x payout ("+eco.fmt(payout)+")"
      : "No match — lost "+eco.fmt(bet);

    return bot.sendText(chatId,"🎰 "+s.join(" | ")+"\n"+result+"\nBalance: "+eco.fmt(u.money),{reply_to_message_id:msg.message_id});
  }
};
