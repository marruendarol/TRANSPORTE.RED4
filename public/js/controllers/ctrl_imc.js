

var ctrl_imc = {
	rObj : {},
	profileData : {},
	userId : {},
	changes : false,
    init : function(obj){
		console.log('Calculadora');
    	ctrl_imc.genObj = template.render('#imcT','#tab_' + obj.id,{})

    	ctrl_imc.genObj.on('getIMC',function(){
    		ctrl_imc.calcular();
    	})

        var $document   = $(document),
        $inputRange = $('input[type="range"]');

        $inputRange.rangeslider({
          polyfill: false 
        });

    
        // Example functionality to demonstrate a value feedback
        function valueOutput(element) {
            var value = element.value,
                output = element.parentNode.getElementsByClassName('rangeslider__handle')[0];
                console.log(output)
            output.innerHTML = value
        }
        for (var i = $inputRange.length - 1; i >= 0; i--) {
            valueOutput($inputRange[i]);
        };
        $document.on('input', 'input[type="range"]', function(e) {
            ctrl_imc.calcular()
            valueOutput(e.target);
        });
        // end
      
        
        ctrl_imc.calcular()
    	// $("#altura").mask("9.99");

    },
    calcular : function(){
    	var altura 	= parseFloat($('#altura').val().replace('.',""));
    	var peso 	= parseFloat($('#peso').val());

    	//console.log(altura,peso)
    	var alturaB = (altura/100*altura/100)
    	//console.log(alturaB,"ALTURA B ")
    	var imc =  parseFloat(peso / alturaB).toFixed(1) ;

    	var values = [
    			{ri:0,rf:17.99,  desc: "Peso bajo. Necesario valorar signos de desnutrición"},
    			{ri:18,rf:24.99, desc: "Normal"},
    			{ri:25,rf:26.99, desc: "Sobrepeso I"},
    			{ri:27,rf:29.99, desc: "Sobrepeso II" },
    			{ri:30,rf:34.99, desc: "Obesidad grado I. Riesgo relativo alto para desarrollar enfermedades cardiovasculares"},
    			{ri:35,rf:39.99, desc: "Obesidad grado II. Riesgo relativo muy alto para el desarrollo de enfermedades cardiovasculares"},
    			{ri:40,rf:50,  desc: "Obesidad grado III. Extrema o Mórbida. Riesgo relativo extremadamente alto para el desarrollo de enfermedades cardiovasculares"},
    			{ri:50,rf:100, desc: "Extrema"},

    	]

    	var resIndex = 0;

    	for (var i = 0; i < values.length; i++) {
    		if(imc>values[i].ri && imc<values[i].rf){
    			resIndex = i ;
    		}
    	}
    	values[resIndex].imc = imc
    	ctrl_imc.genObj.set('imc',values[resIndex])
    	//console.log(values[resIndex],"RESULTADO IMC",imc)

    }
    
};

