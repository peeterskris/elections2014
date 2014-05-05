install.packages("tm")
install.packages("textir")
install.packages("topicmodels")
install.packages("SnowballC")

library(tm)
library("slam")
library("topicmodels")
library(textir)


txtinput <- DirSource('~/git/elections/input/txt', recursive=TRUE)
rawcorpus <- Corpus(txtinput, readerControl = list(language="nl")) 
corpus <- tm_map(rawcorpus, stripWhitespace)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, tolower)
corpus <- tm_map(corpus, removeWords, stopwords("dutch"))
corpus <- tm_map(corpus, stemDocument, language="dutch") # doesn't stem on dutch? 
CMetaData(corpus)

tdm <- TermDocumentMatrix(corpus)
tdm
summary(tdm)
inspect(tdm[1:7,1:7])
findFreqTerms(tdm, 100)
findAssocs(tdm, "milieu", 0.99)
economie = findAssocs(tdm, "economie", 0.90)[1:100]
economie

getTermVectorFromTermDocumentMatrix <- function(tdm) {
  tM <- rowSums(as.matrix(tdm))
  return(rep(names(tM), times = tM))
}

mat = getTermVectorFromTermDocumentMatrix(tdm)
mat


dtm <- DocumentTermMatrix(corpus)
summary(col_sums(dtm))
term_tfidf <- tapply(dtm$v/row_sums(dtm)[dtm$i], dtm$j, mean) * log2(nDocs(dtm)/col_sums(dtm > 0))
summary(term_tfidf)
dtm <- dtm[,term_tfidf >= 5.288e-05]
dtm <- dtm[row_sums(dtm) > 0,]
summary(col_sums(dtm))
dim(dtm)
k <- 10
SEED <- 2010
TM <- list(VEM = LDA(dtm, k = k, control = list(seed = SEED)),
      VEM_fixed = LDA(dtm, k = k, control = list(estimate.alpha = FALSE, seed = SEED)),
      Gibbs = LDA(dtm, k = k, method = "Gibbs", control = list(seed = SEED, burnin = 1000,thin = 100, iter = 1000)),
      CTM = CTM(dtm, k = k, control = list(seed = SEED, var = list(tol = 10^-4), em = list(tol = 10^-3))))

sapply(TM[1:2], slot, "alpha")
sapply(TM, function(x) mean(apply(posterior(x)$topics,  1, function(z) - sum(z * log(z)))))
Topic <- topics(TM[["CTM"]], 1)
Topic
Terms <- terms(TM[["CTM"]], 5)
Terms[,1:5]



tfidf(corpus)
dissimilarity(tdm, method = "Eucledian")
