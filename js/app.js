const { ref, computed, onMounted, nextTick } = Vue

const app = Vue.createApp({
  setup(props, context) {
    const input = ref({
      name: '猫研究部員',
      nickname: 'NekoLab',
      avatar: null,
      grade: 1,
      class: 'A',
      birthDate: new Date().toISOString().slice(0,10)
    })
    const canvas = ref(null)
    let ctx = null

    let templateImage = null
    const cropperImage = ref(null)
    let cropper = null
    let cropperModal = null
    const cropperModalEl = ref(null)

    const dateYear = ref(new Date().getFullYear())

    const birthDateComputed = computed(() => new Date(input.value.birthDate))

    const handleFile = (e) => {
      const reader = new FileReader()
      input.value.file = e.target.files[0]
      reader.onload = async (ee) => {
        await nextTick()
        cropperImage.value.onload = () => {
          cropper.destroy()
          cropperModal.show()
        }
        cropperImage.value.src = ee.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    }

    const refresh = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      // Background
      ctx.drawImage(templateImage, 0, 0, canvas.value.width, canvas.value.height)
      // Draw avatar
      if(input.value.avatar) {
        const maxHeight = 265 * 1.23
        const maxWidth = 335 * 1.23
        const ratio = Math.min(input.value.avatar.width, maxHeight / input.value.avatar.height)
        const x = (42 + (maxWidth - input.value.avatar.width * ratio) / 2)
        const y = (238 + (maxHeight - input.value.avatar.height * ratio) / 2)
        ctx.save()
        roundedImage(x, y, input.value.avatar.width * ratio, input.value.avatar.height * ratio, 0)
        ctx.clip()
        ctx.fillStyle = 'white'
        ctx.fillRect(x, y, input.value.avatar.width * ratio, input.value.avatar.height * ratio)
        ctx.drawImage(input.value.avatar, x, y, input.value.avatar.width * ratio, input.value.avatar.height * ratio)
        ctx.restore()
      }
      // Draw Texts
      const fonts = 'Noto Sans TC, Noto Sans JP'
      // WebKit Text Problem Workaround
      var ua = window.navigator.userAgent;
      var iOS = ua.match(/Macintosh/i) || ua.match(/iPad/i) || ua.match(/iPhone/i);
      var webkit = ua.match(/WebKit/i);
      var iOSSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/EdgiOS/i) && !ua.match(/Chrome/i) && !ua.match(/Edg/i);
      if(iOSSafari){
        colorText(input.value.name, 540, 250, '#3e3e3e', 60, fonts, 450, 'left')
        colorText(input.value.nickname, 990, 330, '#3e3e3e', 25, fonts, 470, 'right')
        colorText(`${input.value.grade}年${input.value.class}組`, 545, 405, '#3e3e3e', 40, fonts, 180, 'left')
        colorText(`${birthDateComputed.value.getMonth()+1}月${birthDateComputed.value.getDate()}日`, 800, 405, '#3e3e3e', 40, fonts, 180, 'left')
      } else {
        colorText(input.value.name, 540, 275, '#3e3e3e', 60, fonts, 450, 'left')
        colorText(input.value.nickname, 990, 335, '#3e3e3e', 25, fonts, 470, 'right')
        colorText(`${input.value.grade}年${input.value.class}組`, 545, 415, '#3e3e3e', 40, fonts, 180, 'left')
        colorText(`${birthDateComputed.value.getMonth()+1}月${birthDateComputed.value.getDate()}日`, 800, 415, '#3e3e3e', 40, fonts, 180, 'left')
      }
    }

    const colorText = (text, x, y, color, size, font, range, align) => {
      ctx.font = size + 'px ' + font
      ctx.textAlign = align
      ctx.fillStyle = color
	  ctx.textBaseline = 'top'
	  
	  let textWidth = ctx.measureText(text).width
	  while (range && textWidth > range && size > 1) {
		size--
		ctx.font = size + 'px ' + font
		textWidth = ctx.measureText(text).width
	  }
	  
      ctx.fillText(text, x, y)
    }

    const download = () => {
      const link = document.createElement('a')
      link.download = 'NekoLab.png'
      link.href = canvas.value.toDataURL()
      link.click()
    }

    const loadImage = (url) => {
      return new Promise((resolve) => {
        const image = new Image()
        image.onload = () => {
          resolve(image)
        }
        image.src = url
      })
    }

    const roundedImage = (x, y, width, height, radius) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    const initCropper = () => {
      cropper = new Cropper(cropperImage.value, {
        autoCropArea: 1,
        aspectRatio: 265/335
      })
    }

    const cropImage = () => {
      input.value.avatar = cropper.getCroppedCanvas()
      refresh()
      cropperModal.hide()
    }

    onMounted(async () => {
      await document.fonts.load('10pt Noto Sans TC')
      await document.fonts.load('10pt Noto Sans JP')
      templateImage = await loadImage('./images/template.png')
      input.value.avatar = await loadImage('./images/default_avatar.jpg')
      ctx = canvas.value.getContext('2d')
      refresh()
      initCropper()
      cropperModal = new bootstrap.Modal(cropperModalEl.value)
      cropperModalEl.value.addEventListener('shown.bs.modal', (event) => {
        initCropper()
      })
    })

    return {
      input,
      canvas,
      ctx,
      dateYear,
      handleFile,
      refresh,
      download,
      cropperImage,
      cropperModal,
      cropperModalEl,
      cropImage
    }
  }
})

app.mount('#app')
