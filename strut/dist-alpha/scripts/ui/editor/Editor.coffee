###
@author Matt Crinklaw-Vogt
###
define(["backbone",
		"./SlideEditor",
		"./transition_editor/TransitionEditor",
		"ui/impress_renderer/ImpressRenderer",
		"ui/widgets/DownloadDialog",
		"ui/widgets/OpenDialog",
		"ui/widgets/SaveAsDialog",
		"storage/FileStorage",
		"ui/widgets/BackgroundPicker",
		"model/common_application/AutoSaver",
		"model/presentation/Archiver",
		'ui/widgets/HiddenOpen',
		'common/FileUtils',
		"css!styles/editor/Editor.css"],
(Backbone, SlideEditor, TransitionEditor, ImpressRenderer, DownloadDialog, OpenDialog, SaveAsDialog, \
FileStorage, BackgroundPicker, AutoSaver, Archiver, HiddenOpen, FileUtils, empty) ->
	editorId = 0

	menuOptions =
		new: (e) ->
			num = localStorage.getItem("StrutNewNum")
			if not num?
				num = 2
			else
				num = parseInt(num)

			localStorage.setItem("StrutNewNum", num+1)
			
			@model.import(
				fileName: "presentation-" + num
				slides: []
			)
			@model.newSlide()
		open: (e) ->
			@openDialog.show((fileName) =>
				console.log "Attempting to open #{fileName}"
				data = FileStorage.open(fileName)
				if data?
					@model.import(data)
					localStorage.setItem("StrutLastPres", fileName)
			)
		openRecent: (e) ->
		save: (e) ->
			fileName = @model.get("fileName")
			if not fileName?
				menuOptions.saveAs.call(@, e)
			else
				FileStorage.save(fileName, @model.toJSON(false, true))

		saveAs: (e) ->
			@saveAsDialog.show((fileName) =>
				if fileName? and fileName isnt ""
					console.log "Attempting to save #{fileName}"
					@model.set("fileName", fileName)
					FileStorage.save(fileName, @model.toJSON(false, true))
			)
		undo: (e) ->
			@model.undo()
		redo: (e) ->
			@model.redo()

		cut: (e) ->
			perspective = @perspectives[@activePerspective]
			if perspective?
				perspective.cut()

		copy: (e) ->
			perspective = @perspectives[@activePerspective]
			if perspective?
				perspective.copy()

		paste: (e) ->
			perspective = @perspectives[@activePerspective]
			if perspective?
				perspective.paste()

		transitionEditor: (e) ->
			@changePerspective(e, {perspective: "transitionEditor"})
		slideEditor: (e) ->
			@changePerspective(e, {perspective: "slideEditor"})
		preview: (e) ->
			@$el.trigger("preview")
		exportJSON: (e) ->
			###@hiddenDownload.trigger(
				mimeType: 'application\/json'
				name: @model.get('fileName')
				value: @model.toJSON(false, true)
			)###
			@downloadDialog.show(JSON.stringify(@model.toJSON(false, true)), @model.get('fileName'))

		importJSON: (e) ->
			@hiddenOpen.trigger((file) =>
				json = FileUtils.toText(file, (json) =>
					@model.import(JSON.parse(json))
				)
			)
			#@importDialog.show((json) =>
			#	@model.import(JSON.parse(json))
			#)

		changeBackground: () ->
			@backgroundPickerModal.show((bgState) =>
				@model.set("background", bgState)
			)

		exportWebpage: () ->
			$('#exportModal').modal('show')

		exportZIP: (e) ->
			archiver = new Archiver(@model)
			archive = archiver.createSimple((archive) =>
				#window.location.href="data:application/zip;base64,"+archive;
				#$('#zipModal').find('a')
				#	.attr('href', "data:application/zip;base64," + archive)
				Downloadify.create('downloadify', {
					filename: 'StrutPresentation.zip'
					data: archive
					dataType: 'base64'
					swf: 'components/downloadify/media/downloadify.swf'
					downloadImage: 'components/downloadify/images/download.png'
					width: 100
					height: 30
					transparent: true
					append: false
				})
				$('#zipModal').modal('show')
			)
			

	Backbone.View.extend(
		className: "editor"
		events:
			"click .menuBar .dropdown-menu > li": "menuItemSelected"
			"changePerspective": "changePerspective"
			"preview": "renderPreview"

		initialize: () ->
			@id = editorId++
			@perspectives =
				slideEditor: new SlideEditor({model: @model})
				transitionEditor: new TransitionEditor({model: @model})

			@activePerspective = "slideEditor"
			@model.undoHistory.on("updated", @undoHistoryChanged, @)
			@model.on("change:background", @_backgroundChanged, @)

			@autoSaver = new AutoSaver(@model)
			@autoSaver.start()

		undoHistoryChanged: () ->
			undoName = @model.undoHistory.undoName()
			redoName = @model.undoHistory.redoName()
			if undoName isnt ""
				$lbl = @$el.find(".undoName")
				$lbl.text(undoName)
				$lbl.removeClass("disp-none")
			else
				@$el.find(".undoName").addClass("disp-none")
			if redoName isnt ""
				$lbl = @$el.find(".redoName")
				$lbl.text(redoName)
				$lbl.removeClass("disp-none")
			else
				@$el.find(".redoName").addClass("disp-none")

		renderPreview: () ->
			showStr = ImpressRenderer.render(@model.attributes)
			#newWind = window.open("data:text/html;charset=utf-8," + escape(showStr))

			#encodeURIComponent(showStr)
			window.previewWind = window.open("index.html?preview=true");
			sourceWind = window;

			cb = () =>
					if (not sourceWind.previewWind.startImpress?)
						setTimeout(cb, 200)
					else
						sourceWind.previewWind.document.getElementsByTagName("html")[0].innerHTML = showStr;
						if not sourceWind.previewWind.impressStarted
							sourceWind.previewWind.startImpress(sourceWind.previewWind.document, sourceWind.previewWind);
							sourceWind.previewWind.imp = sourceWind.previewWind.impress()
							sourceWind.previewWind.imp.init()
							sourceWind.previewWind.imp.goto(@model.get("activeSlide").get("num"))
			
			$(window.previewWind.document).ready(cb)
			#window.location = "index.html?preview=" + showStr;

			#frame = newWind.document.getElementById("presentation")
			#frame.src = "data:text/html;charset=utf-8," + escape(showStr)

		changePerspective: (e, data) ->
			@activePerspective = data.perspective
			_.each(@perspectives, (perspective, key) =>
				if key is @activePerspective
					perspective.show()
				else
					perspective.hide()
			)

		_backgroundChanged: (model, value) ->
			# tell our perspectives about the bg update...
			if value?
				for key,persp of @perspectives
					persp.backgroundChanged(value)

		menuItemSelected: (e) ->
			$target = $(e.currentTarget)
			option = $target.attr("data-option")
			menuOptions[option].call(@, e)

		stopAutoSaving: ->
			@autoSaver.stop()

		startAutoSaving: ->
			@autoSaver.start()

		render: () ->
			perspectives = _.map(@perspectives, (perspective, key) ->
				{
					perspective: key
					name: perspective.name
				}
			)
			@$el.html(JST["editor/Editor"]({
				id: @id
				perspectives: perspectives
			}))

			@$el.find(".dropdown-toggle").dropdown()

			$perspectivesContainer = @$el.find(".perspectives-container")
			_.each(@perspectives, (perspective, key) =>
				$perspectivesContainer.append(perspective.render())
				if key is @activePerspective
					perspective.show()
				else
					perspective.$el.addClass("disp-none")
			)

			@undoHistoryChanged()
			@downloadDialog = new DownloadDialog()
			@$el.append(@downloadDialog.render())

			@hiddenOpen = new HiddenOpen()
			@$el.append(@hiddenOpen.render())

			@openDialog = new OpenDialog()
			@saveAsDialog = new SaveAsDialog()

			showCB = => @stopAutoSaving()
			@openDialog.$el.on('show', showCB)
			@saveAsDialog.$el.on('show', showCB)

			hideCB = => @startAutoSaving()
			@openDialog.$el.on('hide', hideCB)
			@saveAsDialog.$el.on('hide', hideCB)

			@$el.append(@openDialog.render())
			@$el.append(@saveAsDialog.render())

			$('#exportModal').modal()
			$('#zipModal').modal()

			# TEMP
			@backgroundPickerModal = new BackgroundPicker(
					bgOpts:
						type: "radial"
						controlPoints: ["#F0F0F0 0%", "#BEBEBE 100%"]
				)
			@$el.append(@backgroundPickerModal.render())

			@$el
	)
)