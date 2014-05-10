library(tm)
library(plyr)
library(textir)
library(matrixStats)
library(rJava)
library(RWeka)
options(mc.cores=1)

txtinput <- DirSource('~/git/elections/input/txt', encoding = "Latin-1", recursive=TRUE)
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl")) 

corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)
corpus <- tm_map(corpus, removeWords, stopwords("dutch"))
#corpus <- tm_map(corpus, stemDocument, language="dutch") # doesn't stem on dutch? 

BigramTokenizer <- function(x) NGramTokenizer(x, Weka_control(min = 1, max = 3))
txtTdmBi <- TermDocumentMatrix(corpus, control = list(tokenize = BigramTokenizer))
tdm <- txtTdmBi

m <- as.matrix(tdm)
iconv(m,"Latin-1", "UTF-8")
colSums(m)
df <- data.frame(m)
names(df)
df = rename(df, c("cdv.txt"="cdv", "groen.txt"="groen", "nva.txt"="nva", "openvld.txt"="openvld", "pvda.txt"="pvda", "spa.txt"="spa", "vlaamsbelang.txt"="vlaamsbelang"))

#norm.tdm are the term frequencies normalized by document length. 
#We multiply each result with the max document length to have intuitive word counts
norm.tdm <- sweep(m,2,colSums(m),`/`) * max(colSums(m))
norm.tdm <- subset(norm.tdm, rowSums(norm.tdm)>=50)
norm.tdm <- norm.tdm[order(rowSums(norm.tdm),decreasing=T),]
#diff.tdm <- subset(norm.tdm, rowSums(norm.tdm)>=250)
#diff.tdm <- sweep(diff.tdm, 1, rowSums(diff.tdm), `/`)
diff.tdm <- norm.tdm[order(rowVars(norm.tdm),decreasing=T),]

diff.tdm[1:nrow(diff.tdm),]
write.csv(diff.tdm, file = "output/wordcount.csv")
nrow(norm.tdm)
dissimilarity(tdm, method = "Jaccard")

vb <- sort(subset(norm.tdm, norm.tdm[,7]>0)[,7],decreasing=F)
vb
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
