const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { expect } = require('chai')
const Players = require("../src/models/Players");
const playerService = require('../src/services/playerService')

describe("Create and Get Player", () => {
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    const createPlayers = async () => {
        const player1Data = {
            firstname: "First Name 1",
            lastname: "Last Name 1",
            email: "player1@email.com",
            discord: "disc123",
            discordID: null,
        }

        const player2Data = {
            firstname: "First Name 2",
            lastname: "Last Name 2",
            email: "player2@email.com",
            discord: "disc321",
            discordID: null,
        }

        let player1 = await Players.create(player1Data);
        let player2 = await Players.create(player2Data);

        return { player1, player2 }
    };

    it("should return Player document for player 1", async () => {
        let { player1, player2 } = await createPlayers();

        const p = await playerService.getPlayer(player1._id)
        expect(p._id.toString()).to.equal(player1._id.toString())
    })

    it("should fail to create a player with missing required fields", async () => {
        try {
            await Players.create({});
        } catch (error) {
            expect(error).to.exist;
            expect(error.name).to.equal("ValidationError");
        }
    });
})


describe("Update Player Fields", () => {
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    const createPlayers = async () => {
        const player1Data = {
            firstname: "First Name 1",
            lastname: "Last Name 1",
            email: "player1@email.com",
            discord: "disc123",
            discordID: '111',
        }

        const player2Data = {
            firstname: "First Name 2",
            lastname: "Last Name 2",
            email: "player2@email.com",
            discord: "disc321",
            discordID: '222',
        }

        let player1 = await Players.create(player1Data);
        let player2 = await Players.create(player2Data);

        return { player1, player2 }
    };

    it("should update discordID", async () => {
        let { player1, player2 } = await createPlayers();

        const p1 = await playerService.updatePlayerField(player1._id, 'discordID', '333')
        const p2 = await playerService.updatePlayerField(player2._id, 'discordID', '444')
        expect(p1.discordID).to.equal('333')
        expect(p2.discordID).to.equal('444')
    })

    it("should update discordID to null", async () => {
        let { player1, player2 } = await createPlayers();

        const p1 = await playerService.updatePlayerField(player1._id, 'discordID', null)
        const p2 = await playerService.updatePlayerField(player2._id, 'discordID', null)
        expect(p1.discordID).to.equal(null)
        expect(p2.discordID).to.equal(null)
    })
})

