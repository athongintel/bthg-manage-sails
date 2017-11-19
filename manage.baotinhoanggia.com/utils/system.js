module.exports = {
    returnError: function(error){
        "use strict";
        return {success: false, error: error};
    },
    
    returnSuccess: function(result){
        "use strict";
        return {success: true, result: result};
    },
    
    regexEscape: function(exp){
        "use strict";
        if (!exp) return '';
        return String(exp).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },
    
    removeAccent: function(str){
        "use strict";
      
        const accents = [
            ["áảãàạăắẳẵằặâấẩẫầậ", 'a'],
            ["éẻẽèẹêếểễềệ", 'e'],
            ["úủũùụưứửữừự", 'u'],
            ["óỏõòọôốổỗồộơớởỡờợ", 'o'],
            ["íỉĩìị", 'i'],
            ["ýỷỹỳỵ", 'y'],
            ["đ", 'd'],
            ["ÁẢÃÀẠĂẮẲẲẰẶÂẤẨẨẦẬ", 'A'],
            ["ÉẺẼÈẸÊẾỂỄỀỆ", 'e'],
            ["ÚỬŨÙỤƯỨỬỮÙỰ", 'u'],
            ["ÓỎÕÒỌÔỐỔỖỒỘƠỚỞỠỜỢ", 'o'],
            ["ÍỈĨÌỊ", 'i'],
            ["ÝỶỸỲỴ", 'y'],
            ["Đ", 'D'],
        ];
        
        
        if (str && str.length)
            for (let i=0; i<str.length; i++){
                let char = str.substr(i, 1);
                accents.some(accent=>{
                    if (accent[0].indexOf(char) >= 0){
                        //-- replace
                        str = str.replace(char, accent[1]);
                        return true;
                    }
                });
            }
        return str;
    },
    
    isSuperAdmin: function(principal){
        "use strict";
        return principal && principal.user && principal.user.userClass && principal.user.userClass.indexOf(_app.model.User.constants.SUPER_ADMIN) >= 0;
    }
};
