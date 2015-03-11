var serial = ign.sys().serial({port:"/dev/tty.SLAB_USBtoUART"});
serial.out.connect(function(data){
  console.log(data)
  switch(data){
      case '2':
        impress().prev();
        break;
      case '3':
        impress().next();
        break;
      }
})
