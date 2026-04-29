import random
import pandas as pd


# 1: check fro best products , highest score = better rec
# score_matrix is built from the data(excel or DB)
def fitness(chromosome, user_id, score_matrix):
    total = 0.0
    if user_id not in score_matrix.index:
        return 0.0
    user_row = score_matrix.loc[user_id]
    for pid in chromosome:
        if pid in user_row.index:
            total += user_row[pid]
    return total


'''
--------------------------------------------
2 : individuals and population act like a starting point.
role : craete an initial 50 - 80 lists (can be modified for speed effecient reasons if neede).
less lists  = less computing time.
'''

def create_individual(product_ids, size=5):
    return random.sample(product_ids, min(size, len(product_ids)))

def init_population(product_ids, pop_size, rec_size):
    return [create_individual(product_ids, rec_size) for _ in range(pop_size)]


'''
-----------------------------------------------
3 : creates a (survivor) : picks the good parents to reproduce (randomly)
'''
def tournament_selection(population, scores, k=3):
    contestants = random.sample(range(len(population)), k)
    winner = max(contestants, key=lambda i: scores[i])
    return population[winner][:]


'''
------------------------------------------------
4 : crossing two parents and making a list of the new child.
'''
def crossover(parent1, parent2):
    size  = len(parent1)
    point = random.randint(1, size - 1)
    child = parent1[:point]
    for gene in parent2:
        if gene not in child:
            child.append(gene)
        if len(child) == size:
            break
    return child[:size]

'''
------------------------------------------------
5 : 
% chance of making a swap : between one product in list with another product
mutation rate : 20 % for now (able to tweak)...
'''
def mutate(chromosome, all_product_ids, mutation_rate=0.2):
    for i in range(len(chromosome)):
        if random.random() < mutation_rate:
            candidates = [p for p in all_product_ids if p not in chromosome]
            if candidates:
                chromosome[i] = random.choice(candidates)
    return chromosome

'''
6 : MAIN Func
backend calls this func
runs everything above x times / x : lists from 2 above (ex : 80 times)

expected return :
best_chromosome : the x products IDs to recommend
best_score : how good is the product
history : list of x scores (one per Gen -> can be used for chart (optional))
'''
def genetic_algorithm(
    user_id,
    score_matrix,
    all_product_ids,
    pop_size=50,
    generations=80,
    rec_size=5,
    mutation_rate=0.2,
    elitism=2
):
    # start with random population
    population = init_population(all_product_ids, pop_size, rec_size)

    best_chromosome = None
    best_score      = -1.0
    history         = []

    for gen in range(generations):

        # score every individual in the population
        scores = [fitness(ind, user_id, score_matrix) for ind in population]

        # find the best one this generation
        gen_best_idx   = max(range(len(scores)), key=lambda i: scores[i])
        gen_best_score = scores[gen_best_idx]
        history.append(gen_best_score)

        # update global best
        if gen_best_score > best_score:
            best_score      = gen_best_score
            best_chromosome = population[gen_best_idx][:]

        # sort population by score
        paired     = sorted(zip(scores, population), key=lambda x: x[0], reverse=True)
        sorted_pop = [ind for _, ind in paired]

        # keep top individuals unchanged (elitism : keeping elite individuals)
        new_population = [ind[:] for ind in sorted_pop[:elitism]]

        # fill the rest with crossover and mutation
        while len(new_population) < pop_size:
            p1    = tournament_selection(population, scores)
            p2    = tournament_selection(population, scores)
            child = crossover(p1, p2)
            child = mutate(child, all_product_ids, mutation_rate)
            new_population.append(child)

        population = new_population

    return best_chromosome, best_score, history

 # end ( for now )
'''
how can backend calls it (once per request):
from ga_recommender import genetic_algorithm

one req -> 80 generations

type : static , should work also dynamicly if used along user  action (in later update )
'''