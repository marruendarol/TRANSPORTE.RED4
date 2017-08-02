module.exports = function(grunt){
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		watch : {
			uglify : {
				files : ['public/js/controllers/*.js'],
				tasks : ['uglify']
			}
		},

		uglify : {
			options :{
				manage : false,
			},
			my_target : {
				files : [{
					'public/js/controllers/controllers.min.js' : [
						'public/js/controllers/ctrl_main.js',
						'public/js/controllers/ctrl_header.js',
						'public/js/controllers/ctrl_nodeView.js',
						'public/js/controllers/ctrl_baseView.js',
						'public/js/controllers/ctrl_groupView.js',
						'public/js/controllers/ctrl_detailView.js',
						'public/js/controllers/ctrl_propView.js',
						'public/js/controllers/ctrl_templatesView.js',
						'public/js/controllers/ctrl_base.js',
						'public/js/controllers/ctrl_core.js',
						'public/js/controllers/ctrl_user.js',
						'public/js/controllers/ctrl_footer.js',
					]
				}]
			}
		},

		cssmin : {
			my_target :{
				files : [{
					expand: true,
					cwd : 'public/css/',
					src : ['*.css', '!*.min.css'],
					dest : 'public/css/',
					ext : '.min.css'
				}]
			}
		}


	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
//	grunt.registerTask('default', ['uglify']);

}
/*
	expand : true,
					cwd : 'public/js/controllers/',
					src : '*.js',
					dest : 'public/js/controllers/main.min.js'
					*/