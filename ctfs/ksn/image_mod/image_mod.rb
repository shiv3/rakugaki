require 'rmagick'
require 'json'

def read_img(img_path)
    image = img_path
    image = Magick::Image.read(image).first
    return image
end

def Image_Mod(image)
  # image = image.modulate(4.0,4.0,4.0)
  #背景色を20個取得
  backcolors = {}
  20.times do |i|
    samplecolor = image.pixel_color(rand(1024),0).to_color()
    if backcolors[samplecolor].nil?
      backcolors[samplecolor] = 0
    else
      backcolors[samplecolor] += 1
    end
  end
  backcolor = backcolors.sort_by {|k, v| -v }.to_a[0][0] #一番多いのを背景色に

  #背景を白に
  image = image.opaque(backcolor, 'white')
  return image
end

def chk(x,y,color,img)
    c = img.pixel_color(x,y).to_color()
    if c == color
        return true
    end
    return false
end
def chkDirection(x,y,color,img)
    puts "pos:" + "[" + x.to_s + "," + y.to_s + "]"
    dire = ""
    vx = [1,-1]
    vy = [0,1]
    delete_pixels = []
    nextpos = []
    while dire == ""
        vx.each do |_x|
            vy.each do |_y|
                ux = x + _x 
                uy = y + _y
                # puts  "chk:" + ux.to_s + "," + uy.to_s + " " + img.pixel_color(ux,uy).to_color() + " " + chk(ux,uy,color,img).to_s
                if (ux + 1 < 1024 && ux - 1 > 0 ) && ( uy + 1 < 32)
                    if chk(ux,uy,color,img)
                        dire = _x
                        nextpos = [ux,uy]
                    end
                end
            end
        end
        if dire == ""
            y+=1
        end
    end
    return dire,nextpos
end

def SearchDiagonal(x,y,color,img,l_r)
    vx = [1,-1]
    vy = [0,1]
    delete_pixels = []
    vx.each do |_x|
        vy.each do |_y|
            ux = x + _x 
            uy = y + _y
            if (ux + 1 < 1024 && ux - 1 > 0 ) && ( uy + 1 < 32)
                if chk(ux,uy,color,img)
                    delete_pixels.push [ux,uy]
                    if l_r == ""
                        if _x == 1
                            l_r = "r"
                        else
                            l_r = "l"
                        end
                    end
                    if l_r == "r" && _x == 1
                        SearchDiagonal(ux,uy,color,img,"r")
                    elsif l_r == "l" && _x == -1
                        SearchDiagonal(ux,uy,color,img,"l")
                    end
                end
            end
        end
    end

    # if (x+1 < 1024 && x-1 > 0 ) && (y+1 < 32)
    #     if l_r == "r"
    #         x,y=SearchDiagonal(x+1,y,color,img,l_r)  if chk(x+1 ,y  ,color,img) # 右
    #         x,y=SearchDiagonal(x+1,y+1,color,img,l_r)if chk(x+1, y+1,color,img) # 右下
    #     elsif l_r == "l"
    #         x,y=SearchDiagonal(x-1,y,color,img,l_r)  if chk(x-1 ,y,color,img)  # 左
    #         x,y=SearchDiagonal(x-1,y+1,color,img,l_r)if chk(x-1, y+1,color,img) # 左下
    #     else
    #         x,y=SearchDiagonal(x+1,y,color,img,l_r)  if chk(x+1 ,y  ,color,img) # 右
    #         x,y=SearchDiagonal(x+1,y+1,color,img,l_r)if chk(x+1, y+1,color,img) # 右下
    #         x,y=SearchDiagonal(x-1,y,color,img,l_r)  if chk(x-1 ,y,color,img)  # 左
    #         x,y=SearchDiagonal(x-1,y+1,color,img,l_r)if chk(x-1, y+1,color,img) # 左下
    #     end
    # end

    return delete_pixels
end

def DeleteDiagonal(img)
    1024.times do |x|
        samplecolor = img.pixel_color(x,0).to_color()
        diagonalColor = ""
        if samplecolor != "white"
            diagonalColor = samplecolor
            # p SearchDiagonal(x,0,diagonalColor,img,"")
            p chkDirection(x,0,diagonalColor,img)
        end
    end
end

def fillter(image)
  image = image.median_filter(median) #メディアンフィルタでぼかして斜線を消す
  image = image.threshold(58000) #モノクロ

  # image = image.contrast(true)
  # image = image.level(0,3000,2000)
end

def save(image)
  open("./out_image.png", 'w') do |f|
    f.print image.to_blob
  end
end
def crop(image)
    chars = []
    s_size=0
    32.times do |i|
        i2 = image.crop(s_size,0,1024/32,32)
        i2.write("chars/i" + i.to_s + ".png")
        s_size += 32
    end
end
def main(img_path)
    img = read_img(img_path)
    img = Image_Mod(img)
    DeleteDiagonal(img)
    save(img)
end

main(ARGV[0])