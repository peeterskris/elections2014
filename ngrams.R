library(tm)
library(plyr)
library(textir)
library(matrixStats)
library(rJava)
library(RWeka)
options(mc.cores=1)
txtinput <- DirSource('~/git/elections/input/txt', recursive=TRUE)
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl"))
  
corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)
corpus <- tm_map(corpus, removeWords, stopwords("dutch"))
#corpus <- tm_map(corpus, stemDocument, language="dutch") # doesn't stem on dutch? 

#BigramTokenizer <- function(x) NGramTokenizer(x, Weka_control(min = 1, max = 3))
#txtTdmBi <- TermDocumentMatrix(corpus, control = list(tokenize = BigramTokenizer))
txtTdmBi <- TermDocumentMatrix(corpus)


tdm <- txtTdmBi

m <- as.matrix(tdm)
colSums(m)

df <- data.frame(m)
names(df)
df = rename(df, c("cdv.txt"="cdv", "groen.txt"="groen", "nva.txt"="nva", "openvld.txt"="openvld", "pvda.txt"="pvda", "spa.txt"="spa", "vlaamsbelang.txt"="vlaamsbelang"))

#norm.tdm are the term frequencies normalized by document length. 
#We multiply each result with the max document length to have intuitive word counts
#norm.tdm <- round(sweep(m,2,colSums(m),`/`) * max(colSums(m)))
norm.tdm <- m[order(rowSums(m),decreasing=T),]
colSums(norm.tdm)
norm.tdm <- norm.tdm[order(rowSums(norm.tdm),decreasing=T),][1:20000,]
norm.tdm <- subset(norm.tdm, rowSums(norm.tdm)>=3)
#diff.tdm <- sweep(diff.tdm, 1, rowSums(diff.tdm), `/`)
diff.tdm <- norm.tdm[order(rowVars(norm.tdm),decreasing=T),]

diff.tdm[1:nrow(diff.tdm),]
write.csv(norm.tdm, file = "output/wordcount.csv", fileEncoding="UTF-8")
nrow(norm.tdm)
dissimilarity(tdm, method = "Jaccard")


cdv = norm.tdm[order(norm.tdm[,1]-rowMeans(norm.tdm),decreasing=T),]
groen = norm.tdm[order(norm.tdm[,2]-rowMeans(norm.tdm),decreasing=T),]
nva = norm.tdm[order(norm.tdm[,3]-rowMeans(norm.tdm),decreasing=T),]
openvld = norm.tdm[order(norm.tdm[,4]-rowMeans(norm.tdm),decreasing=T),]
pvda = norm.tdm[order(norm.tdm[,5]-rowMeans(norm.tdm),decreasing=T),]
spa = norm.tdm[order(norm.tdm[,6]-rowMeans(norm.tdm),decreasing=T),]
vlaamsbelang = norm.tdm[order(norm.tdm[,7]-rowMeans(norm.tdm),decreasing=T),]


cdvonly = subset(df, df[1]>=min & df[1]==0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
groenonly = subset(df, df[1]== 0 & df[2]>=min & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
nvaonly = subset(df, df[1]== 0 & df[2]==0 & df[3]>=min & df[4]==0 & df[5]==0 & df[6]==0 & df[7]==0)
openvldonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]>=min & df[5]==0 & df[6]==0 & df[7]==0)
pvdaonly = subset(df, df[1]== 0  & df[2]==0 & df[3]==0 & df[4]==0 & df[5]>=min & df[6]==0 & df[7]==0)
spaonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]>=min & df[7]==0)
vlaamsbelangonly = subset(df, df[1]== 0 & df[2]==0 & df[3]==0 & df[4]==0 & df[5]==0 & df[6]==0 & df[7]>=min)





#each term count is divided by the total count over all documents
norm.tfidfm <- sweep(norm.tdm, 1, rowSums(norm.tdm), `/`)


#norm.tdm are the term frequencies normalized by document length. 
#We multiply each result with the max document length to have intuitive word counts
norm.tdm <- sweep(uncommon.m,2,colSums(uncommon.m),`/`) * max(colSums(uncommon.m))
norm.tdm <- norm.tdm[order(rowSums(norm.tdm),decreasing=T),]
norm.tdm <- subset(norm.tdm, rowSums(norm.tdm)>=50)
norm.tdm[150:nrow(norm.tdm),]
nrow(norm.tdm)
dissimilarity(tdm, method = "Jaccard")

priorities <- c()
for(i in 1:7) {
  ap.v <- sort(norm.tfidfm[,i],decreasing=TRUE)
  priorities <- c(priorities, ap.v)
  ap.d <- data.frame(word = names(ap.v),freq=ap.v)
  table(ap.d$freq)
} 
