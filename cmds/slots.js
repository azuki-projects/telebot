const eco=require("../handlers/economy");
const symbols=["🍒","🍋","🍇","🍉","⭐","💎","7️⃣"];

module.exports={
  meta:{
    name:"slots",
    aliases:["slot","5slot"],
    description:"Spin a five-slot machine",
    usage:"/slots <bet | all | half | percent%>",
    category:"Games"
  },
  async run({chatId,u,args,msg,bot}){
    const raw=String(args[0]||"").trim().toLowerCase();
    let bet;

    if(raw==="all"){
      bet=u.money;
    }else if(raw==="half"){
      bet=Math.floor(u.money/2);
    }else if(/^\d+(\.\d+)?%$/.test(raw)){
      const percent=Number(raw.slice(0,-1));
      if(percent<=0||percent>100){
        return bot.sendText(chatId,
          "❌ INVALID BET PERCENTAGE\n\n"+
          "Percentage must be greater than 0% and no more than 100%.\n"+
          "Examples: /slots 25% or /slots 50%",
          {reply_to_message_id:msg.message_id}
        );
      }
      bet=Math.floor(u.money*(percent/100));
    }else{
      bet=eco.parseAmount(raw);
    }

    if(!raw||!Number.isFinite(bet)||bet<=0){
      return bot.sendText(chatId,
        "❌ INVALID BET\n\n"+
        "Usage: /slots <amount | all | half | percent%>\n"+
        "Examples: /slots 5M, /slots half, /slots all, /slots 25%\n\n"+
        "Your balance: "+eco.fmt(u.money),
        {reply_to_message_id:msg.message_id}
      );
    }

    if(bet>u.money){
      const shortfall=bet-u.money;
      return bot.sendText(chatId,
        "❌ INSUFFICIENT BALANCE\n\n"+
        "You don't have enough coins to place this bet.\n\n"+
        "🎰 Bet amount: "+eco.fmt(bet)+"\n"+
        "💰 Your balance: "+eco.fmt(u.money)+"\n"+
        "📉 You need: "+eco.fmt(shortfall)+" more\n\n"+
        "Lower your bet or earn more coins before playing.",
        {reply_to_message_id:msg.message_id}
      );
    }

    const s=Array.from({length:5},()=>symbols[Math.floor(Math.random()*symbols.length)]);
    const counts={};
    s.forEach(x=>counts[x]=(counts[x]||0)+1);
    const max=Math.max(...Object.values(counts));

    // Payout is total returned, including the original bet.
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
