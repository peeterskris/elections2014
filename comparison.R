library(tm)
library(plyr)
library(textir)
library(matrixStats)
options(mc.cores=1)
txtinput <- DirSource('~/git/elections/input/txt', recursive=TRUE)
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl"))

corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)

tdm <- TermDocumentMatrix(corpus)

m <- as.matrix(tdm)
nrWords <- colSums(m)

uniqueWords <- nnzero(m[,1])
uniqueWords <- c(uniqueWords,nnzero(m[,2]))
uniqueWords <- c(uniqueWords,nnzero(m[,3]))
uniqueWords <- c(uniqueWords,nnzero(m[,4]))
uniqueWords <- c(uniqueWords,nnzero(m[,5]))
uniqueWords <- c(uniqueWords,nnzero(m[,6]))
uniqueWords <- c(uniqueWords,nnzero(m[,7]))

nrWords
uniqueWords
