DATEA = ./css/datea.css 
DATEA_LESS = ./less/datea.less
DATE=$(shell date +%I:%M%p)
CHECK=\033[32m✔\033[39m
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#


build:
	@echo "\n${HR}"
	@echo "Building Datea less..."
	@echo "${HR}\n"
	@recess --compile ${DATEA_LESS} > ${DATEA}
	@echo "Compiling LESS with Recess...               ${CHECK} Done"

#
# BUILD SIMPLE BOOTSTRAP DIRECTORY
# recess & uglifyjs are required
#

#
# WATCH LESS FILES
#

watch:
	echo "Watching less files..."; \
	watchr -e "watch('less/.*\.less') { system 'make' }"


