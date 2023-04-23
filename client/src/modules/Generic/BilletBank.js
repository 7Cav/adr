/*This file is used as a reference to tell MilpacParse what billet id's to look for when called on the App.js file. 
Despite all of the magic of my limited JS coding, this file must be updated whenever billets change. 
As such i will provide a method to get updated BilletID's at the end of this document.*/


//Regimental Staff

var regiCommand = ['1','2','3','4','5','6','9','10','60','62'];

//1-7

var oneSevenCommand = ['178','179','180','530'];
var alpha1 = ['196','197','198','199','200','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218','219','220','221','222','223','224','225','226']
var bravo1 = ['227','228','229','230','231','232','233','234','235','236','237','238','239','240','241','242','243','244','245','246','247','248','249','250','251','252','253','254','255','256','257','258','259','260','261','262','263','264','265','266','267','268','269','270','271','272','273','274','275','276','277','278','279','280','281','282','283','284','285'];
var charlie1 = ['286','287','288','289','290','291','292','293','294','295','296','297','298','299','300','301','302','303','304','305','306','307','308','309','310','311','312','313','314','315','316','317','318','319','320','321','322','323','324','325','326','327','328','329','330','331','332','333','334','335','336','337','338','339','340','341','342','343','344'];

//2-7

var twoSevenCommand = ['182','183','184'];
var alpha2 = ['345','346','347','348','349','350','351','352','353','354','355','356','357','358','359','360','361','362','363','364','365','366','367','368','369','370','371','372','373','374','375','376','377','378','379','380','381','382','383','384','385','386','387','388','389','649','650','651','652','653','654'];
var bravo2 = ['390','391','392','393','394','395','396','397','398','399','400','401','402','403','404','405','406','407','408','409','410','411','412','413','414','415','416','417','418','419','420','421','422','423','424','425','426','427','428','429','430','431','432','433','434'];
var charlie2 = ['435','436','437','438','439','440','441','442','443','444','445','446','447','448','449','450','451','452','453','454','455','456','457','458','459','460','461','462','463','464','465','466','467','468','469','470','471','472','473','474','475','476','477','478','479'];

//ACD

var acdCommand = ['552','627','645'];
var alpha3 = ['555','556','557','558','559','560','561','562','563','564','565','566','567','568','569','570','571','572','573','574'];
var bravo3 = ['590','591','592','593','594','595','596','597','598','599','600','601','602','603','604','605','606','607','608','609','610','611','612','613','614','615','616','617','618','619','620','621','622','623','624','625','626'];
var charlie3 = ['656','657','658','659','660','661','662','663','664','665','666','667','668','669','670','671','672'];
var delta3 = ['537','538','575','576'];
var echo3= [];

//IMO

var imoCommand = ['5','9'];
var s1 = ['7','8','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37'];
var s6 = ['50','51','52','53','54','55','56','57','58','59'];
var wag = ['39','40','41','42','43','44','45','46','47','48'];

//ROO

var rooCommand = ['4','60'];
var rrd = ['64','65','577','578','579','580'];
var rtc = ['98','99','100','101','102','103'];
var s5 = ['83','84','85','86','87','88','89','90','91','92','93','94','95','96'];

//SecOps

var secOpsCommand = ['2','62']; //Interesting case for Kleinmen, will need to be renamed to a new billetID if he ever leaves
var jag = ['584'];
var mp = ['168','169','170','171','172','173'];
var s2 = ['161','162','163','164','165','166'];

//Support

var s3 = ['134','135','136','137','138','139','140','141','142','143','144','145','146','147','148','149','150','151','152','153','154','155','156','157','158','159','540','541','542','543'];
var s7 = ['105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','531','532','533','534','535','536','537','539','544','545','546','547','548','549','550','551','629','630','631','632','633','634','635','636','637','638','639','640','641','642','643','644'];
var ld =['126','127','128','129','130','131','132'];
var spd = ['175','176'];

export default {
    regiCommand,
    oneSevenCommand,
    alpha1,
    bravo1,
    charlie1,
    twoSevenCommand,
    alpha2,
    bravo2,
    charlie2,
    acdCommand,
    alpha3,
    bravo3,
    charlie3,
    delta3,
    echo3,
    imoCommand,
    s1,
    s6,
    wag,
    rooCommand,
    rrd,
    rtc,
    s5,
    secOpsCommand,
    jag,
    mp,
    s2,
    s3,
    s7,
    spd,
    ld,
};

/* Need updated billetID's? here is what you can do:

The number 1 thing you can do is ask the S6 1IC to provide you with a list of any BilletID's that have been recently changed.
If the 1IC is busy or a dick, you can do it manually:

Open a milpacs tab of a member that has the billet you need. for example: https://7cav.us/rosters/profile/1900/ i want his primary billet ID
Open another tab to the following link https://api.7cav.us/                                                 ^---------------------------┐
On the API tab, click authorize and provide it your API key, to get your API key, see line 107                                          |
Click the 'Get given user milpac profile' dropdown, then click 'Try it out'                                                             |
You will be prompted for a userID. The userID is the number in the link of the persons milpac. For my example case, the user id is   (1900)
Upon sucessful response you will get a small json of the user, if you look through it you should find the position title and the position ID you are looking for.

You can get the API key by going to https://7cav.us/account/connected-accounts/ then viewing your account in Auth.7cav
*/
