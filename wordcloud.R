library(tm)
require(wordcloud)
require(RColorBrewer)


txtinput <- DirSource('~/git/elections/input/txt', recursive=TRUE)
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl")) 
corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)
corpus <- tm_map(corpus, removeWords, stopwords("dutch"))
#corpus <- tm_map(corpus, stemDocument, language="dutch") # doesn't stem on dutch? 

ap.tdm <- TermDocumentMatrix(corpus)


for(i in 1:7) {
  ap.v <- sort(ap.m[,i],decreasing=TRUE)
  ap.d <- data.frame(word = names(ap.v),freq=ap.v)
  table(ap.d$freq)
  pal2 <- brewer.pal(8,"Dark2")
  png(paste(colnames(ap.m)[i],"png",sep="."), width=1280,height=800)
  wordcloud(ap.d$word,ap.d$freq, scale=c(8,.2),min.freq=3,
          max.words=Inf, random.order=FALSE, rot.per=.15, colors=pal2)
  dev.off()
} 



