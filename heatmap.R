library(tm)
library(plyr)
library(textir)
library(matrixStats)
library (gplots)
library(ggplot2)

txtinput <- DirSource('~/git/elections/input/txt', recursive=TRUE,  encoding = "latin1")
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl")) 
corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)
corpus <- tm_map(corpus, removeWords, stopwords("dutch"))
#corpus <- tm_map(corpus, stemDocument, language="dutch") # doesn't stem on dutch? 

tdm <- TermDocumentMatrix(corpus)
m <- as.matrix(tdm)
colSums(m)
df <- data.frame(m)
names(df)
df = rename(df, c("cdv.txt"="cdv", "groen.txt"="groen", "nva.txt"="nva", "openvld.txt"="openvld", "pvda.txt"="pvda", "spa.txt"="spa", "vlaamsbelang.txt"="vlaamsbelang"))

min = 3
cdvonly = subset(df, df[1]>=min & df[1]==0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
groenonly = subset(df, df[1]== 0 & df[2]>=min & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
nvaonly = subset(df, df[1]== 0 & df[2]==0 & df[3]>=min & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
openvldonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]>=min & df[5]==0 & df[6]==0 & df[7]==0)
pvdaonly = subset(df, df[1]== 0  & df[2]==0 & df[3]==0 & df[4]==0 & df[5]>=min & df[6]==0 & df[7]==0)
spaonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]>=min & df[7]==0)
vlaamsbelangonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]>=min)

uncommon.m = subset(m, m[,1]!=0 & m[,2]!=0 & m[,3]!=0 & m[,4]!=0 & m[,5]!=0 & m[,6]!=0 & m[,7]!=0)

#norm.tdm are the term frequencies normalized by document length. 
#We multiply each result with the max document length to have intuitive word counts
norm.tdm <- sweep(m,2,colSums(m),`/`) * max(colSums(m))
norm.tdm <- norm.tdm[order(rowSums(norm.tdm),decreasing=T),]
popular.tdm <- norm.tdm <- norm.tdm[order(rowSums(norm.tdm),decreasing=T),]
#diff.tdm <- subset(norm.tdm, rowSums(norm.tdm)>=250)
#diff.tdm <- sweep(diff.tdm, 1, rowSums(diff.tdm), `/`)
diff.tdm <- norm.tdm[order(rowVars(norm.tdm),decreasing=T),]
data <- diff.tdm



#########################################################
### C) Customizing and plotting the heat map
#########################################################

# creates a own color palette from red to green
my_palette <- colorRampPalette(c("red", "yellow", "green"))(n = 299)

# (optional) defines the color breaks manually for a "skewed" color transition
col_breaks = c(seq(-1,0,length=100),  # for red
               seq(0,0.8,length=100),              # for yellow
               seq(0.8,1,length=100))              # for green

mat_data <- data[10:25,]
mat_data
# creates a 5 x 5 inch image
png("output/heatmaps_in_r.png",    # create PNG for the heat map        
    width = 5*300,        # 5 x 300 pixels
    height = 5*300,
    res = 300,            # 300 pixels per inch
    pointsize = 8)        # smaller font size

heatmap.2(mat_data, 
          #cellnote = mat_data,  # same data set for cell labels
          main = "Correlation", # heat map title
          notecol="black",      # change font color of cell labels to black
          density.info="none",  # turns off density plot inside color legend
          trace="none",         # turns off trace lines inside the heat map
          #margins =c(12,9),     # widens margins around plot
          #col=my_palette,       # use on color palette defined earlier 
          #breaks=col_breaks,    # enable color transition at specified limits
          dendrogram="none",     # only draw a row dendrogram
          Colv="NA")            # turn off column clustering

dev.off()               # close the PNG device


ggplot(data,  +        ## global aes
  geom_tile(aes(fill = rectheat)) +         ## to get the rect filled
  geom_point(aes(colour = circlefill, 
                 size =circlesize))  +    ## geom_point for circle illusion
  scale_color_gradient(low = "yellow",  
                       high = "red")+       ## color of the corresponding aes
  scale_size(range = c(1, 20))+             ## to tune the size of circles
  theme_bw()